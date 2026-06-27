import { supabase } from '@/lib/supabase';
import {
  maxQrisSize,
  qrisExtensions,
  qrisMimeTypes,
  type PaymentMethodFormInput
} from '@features/admin/schemas/payment-method.schemas';
import type {
  AdminPaymentMethod,
  AdminPaymentMethodType,
  AdminPaymentProofPreview,
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

function asPaymentMethodType(value: unknown): AdminPaymentMethodType {
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

  return supabase.storage
    .from('payment-methods')
    .getPublicUrl(getPaymentMethodObjectPath(qrImageUrl)).data.publicUrl;
}

function mapPaymentMethod(row: Record<string, unknown>): AdminPaymentMethod {
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
    sort_order: Number(row.sort_order ?? 0),
    created_at: asString(row.created_at)
  };
}

function validateQrisFile(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (!qrisMimeTypes.includes(file.type) || !qrisExtensions.includes(extension)) {
    throw new Error('File QRIS harus jpg, jpeg, png, atau webp.');
  }

  if (file.size > maxQrisSize) {
    throw new Error('Ukuran file QRIS maksimal 5MB.');
  }
}

function paymentMethodPayload(input: PaymentMethodFormInput, qrImageUrl: string | null) {
  return {
    method_type: input.methodType,
    name: input.name,
    account_number: input.accountNumber || null,
    account_name: input.accountName || null,
    bank_name: input.bankName || null,
    qr_image_url: qrImageUrl,
    instructions: input.instructions || null,
    is_active: input.isActive,
    sort_order: input.sortOrder,
    metadata: {}
  };
}

const paymentRequestSelect =
  'id, workspace_id, user_id, plan_code, amount, method, proof_url, status, note, approved_by, approved_at, rejected_reason, created_at';

const paymentMethodSelect =
  'id, method_type, name, account_number, account_name, bank_name, qr_image_url, instructions, is_active, sort_order, created_at';

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
  },

  async getPaymentProofPreview(proofUrl: string): Promise<AdminPaymentProofPreview> {
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
  },

  async getPaymentMethods(): Promise<AdminPaymentMethod[]> {
    const { data, error } = (await supabase
      .from('payment_methods')
      .select(paymentMethodSelect)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })) as unknown as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil metode pembayaran.');

    return (data ?? []).map(mapPaymentMethod);
  },

  async uploadQrisImage(file: File): Promise<string> {
    validateQrisFile(file);

    const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const safeName = file.name
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
    const objectPath = `qris/${Date.now()}-${safeName || 'qris'}.${extension}`;
    const { error } = await supabase.storage
      .from('payment-methods')
      .upload(objectPath, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false
      });

    assertSupabaseSuccess(error, 'Gagal upload gambar QRIS.');

    return `payment-methods/${objectPath}`;
  },

  async createPaymentMethod(input: PaymentMethodFormInput): Promise<AdminPaymentMethod> {
    const qrisFile = input.qrisFile?.item(0) ?? null;
    const qrImageUrl = qrisFile ? await this.uploadQrisImage(qrisFile) : null;

    if (input.methodType === 'qris' && !qrImageUrl) {
      throw new Error('Gambar QRIS wajib diupload.');
    }

    const { data, error } = (await supabase
      .from('payment_methods')
      .insert(paymentMethodPayload(input, qrImageUrl))
      .select(paymentMethodSelect)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal membuat metode pembayaran.');

    if (!data) {
      throw new Error('Metode pembayaran tidak berhasil dibuat.');
    }

    return mapPaymentMethod(data);
  },

  async updatePaymentMethod(
    paymentMethod: AdminPaymentMethod,
    input: PaymentMethodFormInput
  ): Promise<AdminPaymentMethod> {
    const qrisFile = input.qrisFile?.item(0) ?? null;
    const nextQrImageUrl = qrisFile ? await this.uploadQrisImage(qrisFile) : paymentMethod.qr_image_url;

    if (input.methodType === 'qris' && !nextQrImageUrl) {
      throw new Error('Gambar QRIS wajib diupload.');
    }

    const { data, error } = (await supabase
      .from('payment_methods')
      .update(paymentMethodPayload(input, nextQrImageUrl))
      .eq('id', paymentMethod.id)
      .select(paymentMethodSelect)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengubah metode pembayaran.');

    if (!data) {
      throw new Error('Metode pembayaran tidak ditemukan.');
    }

    return mapPaymentMethod(data);
  },

  async togglePaymentMethod(paymentMethod: AdminPaymentMethod): Promise<void> {
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_active: !paymentMethod.is_active })
      .eq('id', paymentMethod.id);

    assertSupabaseSuccess(error, 'Gagal mengubah status metode pembayaran.');
  },

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    const { error } = await supabase.from('payment_methods').delete().eq('id', paymentMethodId);

    assertSupabaseSuccess(error, 'Gagal menghapus metode pembayaran.');
  }
};
