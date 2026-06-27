import { supabase } from '@/lib/supabase';
import type { BillingData, PaymentRequest, Plan, PlanFeatures, WorkspaceSubscription } from '@features/premium/types/premium.types';

type SupabaseErrorLike = {
  message?: string;
};

function assertSupabaseSuccess(error: SupabaseErrorLike | null, fallbackMessage: string) {
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asOptionalString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function asOptionalNumber(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  return Number(value);
}

function asFeatures(value: unknown): PlanFeatures {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<PlanFeatures>((features, [key, featureValue]) => {
    features[key] = Boolean(featureValue);
    return features;
  }, {});
}

function mapPlan(row: Record<string, unknown>): Plan {
  return {
    id: asString(row.id),
    code: asString(row.code),
    name: asString(row.name),
    description: asOptionalString(row.description),
    price_monthly: Number(row.price_monthly ?? 0),
    price_yearly: Number(row.price_yearly ?? 0),
    max_workspaces: asOptionalNumber(row.max_workspaces),
    max_members: asOptionalNumber(row.max_members),
    max_wallets: asOptionalNumber(row.max_wallets),
    max_transactions_per_month: asOptionalNumber(row.max_transactions_per_month),
    features: asFeatures(row.features),
    is_active: Boolean(row.is_active)
  };
}

function mapSubscription(row: Record<string, unknown> | null, workspaceId: string): WorkspaceSubscription {
  if (!row) {
    return {
      id: null,
      workspace_id: workspaceId,
      plan_code: 'free',
      status: 'active',
      started_at: null,
      expired_at: null
    };
  }

  return {
    id: asOptionalString(row.id),
    workspace_id: asString(row.workspace_id, workspaceId),
    plan_code: asString(row.plan_code, 'free'),
    status: asString(row.status, 'active'),
    started_at: asOptionalString(row.started_at),
    expired_at: asOptionalString(row.expired_at)
  };
}

function mapPaymentRequest(row: Record<string, unknown>): PaymentRequest {
  return {
    id: asString(row.id),
    workspace_id: asString(row.workspace_id),
    user_id: asString(row.user_id),
    plan_code: asString(row.plan_code),
    amount: Number(row.amount ?? 0),
    method: asOptionalString(row.method),
    proof_url: asOptionalString(row.proof_url),
    status: asString(row.status, 'pending'),
    note: asOptionalString(row.note),
    approved_at: asOptionalString(row.approved_at),
    rejected_reason: asOptionalString(row.rejected_reason),
    created_at: asString(row.created_at)
  };
}

const planSelect =
  'id, code, name, description, price_monthly, price_yearly, max_workspaces, max_members, max_wallets, max_transactions_per_month, features, is_active';

const subscriptionSelect = 'id, workspace_id, plan_code, status, started_at, expired_at';

const paymentRequestSelect =
  'id, workspace_id, user_id, plan_code, amount, method, proof_url, status, note, approved_at, rejected_reason, created_at';

export const PremiumService = {
  async getPlans(): Promise<Plan[]> {
    const { data, error } = (await supabase
      .from('plans')
      .select(planSelect)
      .eq('is_active', true)
      .order('price_monthly', { ascending: true })) as unknown as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil daftar plan.');

    return (data ?? []).map(mapPlan);
  },

  async getWorkspaceSubscription(workspaceId: string): Promise<WorkspaceSubscription> {
    const { data, error } = (await supabase
      .from('workspace_subscriptions')
      .select(subscriptionSelect)
      .eq('workspace_id', workspaceId)
      .maybeSingle()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil subscription workspace.');

    return mapSubscription(data, workspaceId);
  },

  async getPaymentRequests(workspaceId: string): Promise<PaymentRequest[]> {
    const { data, error } = (await supabase
      .from('payment_requests')
      .select(paymentRequestSelect)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })) as unknown as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil payment request.');

    return (data ?? []).map(mapPaymentRequest);
  },

  async getBillingData(workspaceId: string): Promise<BillingData> {
    const [plans, subscription, paymentRequests] = await Promise.all([
      this.getPlans(),
      this.getWorkspaceSubscription(workspaceId),
      this.getPaymentRequests(workspaceId)
    ]);
    const activePlan = plans.find((plan) => plan.code === subscription.plan_code) ?? plans.find((plan) => plan.code === 'free');

    if (!activePlan) {
      throw new Error('Plan Free belum tersedia.');
    }

    return {
      activePlan,
      paymentRequests,
      plans,
      subscription
    };
  },

  async createPaymentRequest(workspaceId: string, userId: string, plan: Plan): Promise<PaymentRequest> {
    const { data, error } = (await supabase
      .from('payment_requests')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        plan_code: plan.code,
        amount: plan.price_monthly,
        method: 'manual_transfer',
        status: 'pending',
        note: 'Upgrade request dibuat dari aplikasi Vinari.',
        metadata: {
          billing_cycle: 'monthly',
          plan_name: plan.name
        }
      })
      .select(paymentRequestSelect)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal membuat payment request.');

    if (!data) {
      throw new Error('Payment request tidak berhasil dibuat.');
    }

    return mapPaymentRequest(data);
  }
};
