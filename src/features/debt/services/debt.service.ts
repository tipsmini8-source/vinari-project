import { supabase } from '@/lib/supabase';
import type {
  Debt,
  DebtFormInput,
  DebtPayment,
  DebtPaymentFormInput,
  DebtReferenceWallet,
  DebtStatus,
  DebtWithProgress
} from '@features/debt/types/debt.types';

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
  return typeof value === 'number' ? value : value === null || value === undefined ? null : Number(value);
}

function asDebtStatus(value: unknown): DebtStatus {
  if (value === 'paid' || value === 'cancelled') {
    return value;
  }

  return 'active';
}

function withProgress(debt: Debt): DebtWithProgress {
  const paidAmount = debt.principal_amount - debt.remaining_amount;
  const percentage = debt.principal_amount > 0 ? Math.round((paidAmount / debt.principal_amount) * 100) : 0;

  return {
    ...debt,
    paid_amount: paidAmount,
    percentage
  };
}

function mapDebt(row: Record<string, unknown>): DebtWithProgress {
  const debt: Debt = {
    id: asString(row.id),
    workspace_id: asString(row.workspace_id),
    name: asString(row.name),
    lender_name: asOptionalString(row.lender_name),
    principal_amount: Number(row.principal_amount ?? 0),
    remaining_amount: Number(row.remaining_amount ?? 0),
    installment_amount: asOptionalNumber(row.installment_amount),
    interest_rate: Number(row.interest_rate ?? 0),
    due_date: asOptionalString(row.due_date),
    start_date: asOptionalString(row.start_date),
    end_date: asOptionalString(row.end_date),
    status: asDebtStatus(row.status),
    note: asOptionalString(row.note),
    created_at: asString(row.created_at)
  };

  return withProgress(debt);
}

function mapPayment(row: Record<string, unknown>): DebtPayment {
  const wallet = row.wallet as { name?: string } | null | undefined;

  return {
    id: asString(row.id),
    workspace_id: asString(row.workspace_id),
    debt_id: asString(row.debt_id),
    wallet_id: asOptionalString(row.wallet_id),
    amount: Number(row.amount ?? 0),
    payment_date: asString(row.payment_date),
    note: asOptionalString(row.note),
    created_at: asString(row.created_at),
    wallet_name: wallet?.name ?? null
  };
}

function toDebtInsertPayload(workspaceId: string, input: DebtFormInput) {
  return {
    workspace_id: workspaceId,
    name: input.name,
    lender_name: input.lenderName || null,
    principal_amount: input.principalAmount,
    remaining_amount: input.principalAmount,
    installment_amount: input.installmentAmount ?? null,
    interest_rate: input.interestRate ?? 0,
    due_date: input.dueDate || null,
    start_date: input.startDate || null,
    end_date: input.endDate || null,
    status: input.status,
    note: input.note || null,
    metadata: {}
  };
}

function toDebtUpdatePayload(workspaceId: string, input: DebtFormInput) {
  return {
    workspace_id: workspaceId,
    name: input.name,
    lender_name: input.lenderName || null,
    principal_amount: input.principalAmount,
    installment_amount: input.installmentAmount ?? null,
    interest_rate: input.interestRate ?? 0,
    due_date: input.dueDate || null,
    start_date: input.startDate || null,
    end_date: input.endDate || null,
    status: input.status,
    note: input.note || null,
    metadata: {}
  };
}

const debtSelect =
  'id, workspace_id, name, lender_name, principal_amount, remaining_amount, installment_amount, interest_rate, due_date, start_date, end_date, status, note, created_at';

const paymentSelect =
  'id, workspace_id, debt_id, wallet_id, amount, payment_date, note, created_at, wallet:wallets(name)';

export const DebtService = {
  async getDebts(workspaceId: string): Promise<DebtWithProgress[]> {
    const { data, error } = (await supabase
      .from('debts')
      .select(debtSelect)
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .order('status', { ascending: true })
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })) as unknown as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil daftar hutang.');

    return (data ?? []).map(mapDebt);
  },

  async getDebt(debtId: string, workspaceId: string): Promise<DebtWithProgress> {
    const { data, error } = (await supabase
      .from('debts')
      .select(debtSelect)
      .eq('id', debtId)
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil detail hutang.');

    if (!data) {
      throw new Error('Hutang tidak ditemukan.');
    }

    return mapDebt(data);
  },

  async getPayments(debtId: string, workspaceId: string): Promise<DebtPayment[]> {
    const { data, error } = (await supabase
      .from('debt_payments')
      .select(paymentSelect)
      .eq('debt_id', debtId)
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .order('payment_date', { ascending: false })
      .order('created_at', { ascending: false })) as unknown as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil histori pembayaran.');

    return (data ?? []).map(mapPayment);
  },

  async getWallets(workspaceId: string): Promise<DebtReferenceWallet[]> {
    const { data, error } = (await supabase
      .from('wallets')
      .select('id, name, wallet_type')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .eq('is_archived', false)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })) as unknown as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil wallet.');

    return (data ?? []).map((wallet) => ({
      id: asString(wallet.id),
      name: asString(wallet.name),
      wallet_type: asString(wallet.wallet_type)
    }));
  },

  async createDebt(workspaceId: string, input: DebtFormInput): Promise<DebtWithProgress> {
    const { data, error } = (await supabase
      .from('debts')
      .insert(toDebtInsertPayload(workspaceId, input))
      .select(debtSelect)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal membuat hutang.');

    if (!data) {
      throw new Error('Hutang tidak berhasil dibuat.');
    }

    return mapDebt(data);
  },

  async updateDebt(debtId: string, workspaceId: string, input: DebtFormInput): Promise<DebtWithProgress> {
    const { data, error } = (await supabase
      .from('debts')
      .update(toDebtUpdatePayload(workspaceId, input))
      .eq('id', debtId)
      .eq('workspace_id', workspaceId)
      .select(debtSelect)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengubah hutang.');

    if (!data) {
      throw new Error('Hutang tidak ditemukan.');
    }

    return mapDebt(data);
  },

  async deleteDebt(debtId: string, workspaceId: string): Promise<void> {
    const { error } = await supabase
      .from('debts')
      .update({
        deleted_at: new Date().toISOString(),
        status: 'cancelled'
      })
      .eq('id', debtId)
      .eq('workspace_id', workspaceId);

    assertSupabaseSuccess(error, 'Gagal menghapus hutang.');
  },

  async addPayment(debtId: string, workspaceId: string, input: DebtPaymentFormInput): Promise<DebtPayment> {
    const debt = await this.getDebt(debtId, workspaceId);

    if (input.amount > debt.remaining_amount) {
      throw new Error('Pembayaran tidak boleh lebih besar dari sisa hutang.');
    }

    const { data, error } = (await supabase
      .from('debt_payments')
      .insert({
        workspace_id: workspaceId,
        debt_id: debtId,
        wallet_id: input.walletId || null,
        amount: input.amount,
        payment_date: input.paymentDate,
        note: input.note || null,
        metadata: {}
      })
      .select(paymentSelect)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal menambah pembayaran.');

    if (!data) {
      throw new Error('Pembayaran tidak berhasil dibuat.');
    }

    return mapPayment(data);
  }
};
