import { supabase } from '@/lib/supabase';
import {
  allowedProofExtensions,
  allowedProofMimeTypes,
  maxProofSize
} from '@features/premium/schemas/payment-proof.schemas';
import type {
  BillingData,
  PaymentMethod,
  PaymentMethodType,
  PaymentProofPreview,
  PaymentRequest,
  Plan,
  PlanFeatures,
  WorkspaceSubscription
} from '@features/premium/types/premium.types';

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

function asPaymentMethodType(value: unknown): PaymentMethodType {
  if (value === 'bank_transfer' || value === 'ewallet' || value === 'manual') {
    return value;
  }

  return 'qris';
}

function getPaymentMethodObjectPath(qrImageUrl: string) {
  return qrImageUrl.startsWith('payment-methods/')
    ? qrImageUrl.slice('payment-methods/'.length)
    : qrImageUrl;
}

function getPaymentMethodPublicUrl(qrImageUrl: string | null) {
  if (!qrImageUrl) {
    return null;
  }

  const objectPath = getPaymentMethodObjectPath(qrImageUrl);
  return supabase.storage.from('payment-methods').getPublicUrl(objectPath).data.publicUrl;
}

function mapPaymentMethod(row: Record<string, unknown>): PaymentMethod {
  const qrImageUrl = asOptionalString(row.qr_image_url);

  return {
    id: asString(row.id),
    method_type: asPaymentMethodType(row.method_type),
    name: asString(row.name),
    account_number: asOptionalString(row.account_number),
    account_name: asOptionalString(row.account_name),
    bank_name: asOptionalString(row.bank_name),
    qr_image_url: qrImageUrl,
    qr_image_public_url: getPaymentMethodPublicUrl(qrImageUrl),
    instructions: asOptionalString(row.instructions),
    is_active: Boolean(row.is_active),
    sort_order: Number(row.sort_order ?? 0)
  };
}

function getProofObjectPath(proofUrl: string) {
  return proofUrl.startsWith('premium-proofs/') ? proofUrl.slice('premium-proofs/'.length) : proofUrl;
}

function getFileName(path: string) {
  return path.split('/').pop() ?? path;
}

function isImagePath(path: string) {
  return /\.(jpg|jpeg|png|webp)$/i.test(path);
}

function isPdfPath(path: string) {
  return /\.pdf$/i.test(path);
}

function validateProofFile(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (!allowedProofMimeTypes.includes(file.type) || !allowedProofExtensions.includes(extension)) {
    throw new Error('Format file harus jpg, jpeg, png, webp, atau pdf.');
  }

  if (file.size > maxProofSize) {
    throw new Error('Ukuran file maksimal 5MB.');
  }
}

const planSelect =
  'id, code, name, description, price_monthly, price_yearly, max_workspaces, max_members, max_wallets, max_transactions_per_month, features, is_active';

const subscriptionSelect = 'id, workspace_id, plan_code, status, started_at, expired_at';

const paymentRequestSelect =
  'id, workspace_id, user_id, plan_code, amount, method, proof_url, status, note, approved_at, rejected_reason, created_at';

const paymentMethodSelect =
  'id, method_type, name, account_number, account_name, bank_name, qr_image_url, instructions, is_active, sort_order';

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

  async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    const { data, error } = (await supabase
      .from('payment_methods')
      .select(paymentMethodSelect)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })) as unknown as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil metode pembayaran.');

    return (data ?? []).map(mapPaymentMethod);
  },

  async getBillingData(workspaceId: string): Promise<BillingData> {
    const [plans, subscription, paymentRequests, paymentMethods] = await Promise.all([
      this.getPlans(),
      this.getWorkspaceSubscription(workspaceId),
      this.getPaymentRequests(workspaceId),
      this.getActivePaymentMethods()
    ]);
    const activePlan = plans.find((plan) => plan.code === subscription.plan_code) ?? plans.find((plan) => plan.code === 'free');

    if (!activePlan) {
      throw new Error('Plan Free belum tersedia.');
    }

    return {
      activePlan,
      paymentMethods,
      paymentRequests,
      plans,
      subscription
    };
  },

  async createPaymentRequest(
    workspaceId: string,
    userId: string,
    plan: Plan,
    paymentMethod: PaymentMethod
  ): Promise<PaymentRequest> {
    const { data, error } = (await supabase
      .from('payment_requests')
      .insert({
        workspace_id: workspaceId,
        user_id: userId,
        plan_code: plan.code,
        amount: plan.price_monthly,
        method: `${paymentMethod.method_type} - ${paymentMethod.name}`,
        status: 'pending',
        note: 'Upgrade request dibuat dari aplikasi Vinari.',
        metadata: {
          billing_cycle: 'monthly',
          payment_method_id: paymentMethod.id,
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
  },

  async uploadPaymentProof(paymentRequest: PaymentRequest, userId: string, file: File): Promise<string> {
    if (paymentRequest.status !== 'pending') {
      throw new Error('Bukti hanya bisa diupload saat payment request masih pending.');
    }

    if (paymentRequest.user_id !== userId) {
      throw new Error('Bukti hanya bisa diupload oleh pembuat payment request.');
    }

    validateProofFile(file);

    const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const objectPath = `${userId}/${paymentRequest.id}-${Date.now()}.${extension}`;
    const proofPath = `premium-proofs/${objectPath}`;
    const { error: uploadError } = await supabase.storage
      .from('premium-proofs')
      .upload(objectPath, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false
      });

    assertSupabaseSuccess(uploadError, 'Gagal upload bukti pembayaran.');

    const { error: attachError } = await supabase.rpc('attach_payment_proof', {
      payment_request_uuid: paymentRequest.id,
      proof_path: proofPath
    });

    assertSupabaseSuccess(attachError, 'Gagal menyimpan bukti pembayaran.');

    return proofPath;
  },

  async getPaymentProofPreview(proofUrl: string): Promise<PaymentProofPreview> {
    const objectPath = getProofObjectPath(proofUrl);
    const { data, error } = await supabase.storage
      .from('premium-proofs')
      .createSignedUrl(objectPath, 60 * 10);

    assertSupabaseSuccess(error, 'Gagal membuka bukti pembayaran.');

    if (!data?.signedUrl) {
      throw new Error('Bukti pembayaran tidak ditemukan.');
    }

    return {
      fileName: getFileName(objectPath),
      isImage: isImagePath(objectPath),
      isPdf: isPdfPath(objectPath),
      path: proofUrl,
      signedUrl: data.signedUrl
    };
  }
};
