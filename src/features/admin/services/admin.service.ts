import { supabase } from '@/lib/supabase';
import type {
  AdminPaymentRequest,
  AdminPaymentStats,
  AdminPaymentStatus
} from '@features/admin/types/admin.types';

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

function mapPaymentRequest(row: Record<string, unknown>): AdminPaymentRequest {
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
    approved_by: asOptionalString(row.approved_by),
    approved_at: asOptionalString(row.approved_at),
    rejected_reason: asOptionalString(row.rejected_reason),
    created_at: asString(row.created_at)
  };
}

const paymentRequestSelect =
  'id, workspace_id, user_id, plan_code, amount, method, proof_url, status, note, approved_by, approved_at, rejected_reason, created_at';

export const AdminService = {
  async isAdmin(): Promise<boolean> {
    const { data, error } = (await supabase.rpc('is_admin')) as unknown as {
      data: boolean | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal memeriksa akses admin.');

    return Boolean(data);
  },

  async getPaymentRequests(status: AdminPaymentStatus): Promise<AdminPaymentRequest[]> {
    let query = supabase
      .from('payment_requests')
      .select(paymentRequestSelect)
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = (await query) as unknown as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil payment request.');

    return (data ?? []).map(mapPaymentRequest);
  },

  async getPaymentStats(): Promise<AdminPaymentStats> {
    const requests = await this.getPaymentRequests('all');

    return requests.reduce<AdminPaymentStats>(
      (stats, request) => {
        if (request.status === 'approved') {
          stats.approved += 1;
        } else if (request.status === 'rejected') {
          stats.rejected += 1;
        } else if (request.status === 'pending') {
          stats.pending += 1;
        }

        return stats;
      },
      {
        approved: 0,
        pending: 0,
        rejected: 0
      }
    );
  },

  async approvePaymentRequest(paymentRequestId: string): Promise<void> {
    const { error } = await supabase.rpc('approve_payment_request', {
      payment_request_uuid: paymentRequestId
    });

    assertSupabaseSuccess(error, 'Gagal approve payment request.');
  },

  async rejectPaymentRequest(paymentRequestId: string, reason: string): Promise<void> {
    const { error } = await supabase.rpc('reject_payment_request', {
      payment_request_uuid: paymentRequestId,
      reason
    });

    assertSupabaseSuccess(error, 'Gagal reject payment request.');
  }
};
