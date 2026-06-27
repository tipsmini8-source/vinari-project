import { supabase } from '@/lib/supabase';
import type {
  Transaction,
  TransactionFilterInput,
  TransactionFormInput,
  TransactionReferenceCategory,
  TransactionReferenceWallet
} from '@features/transaction/types/transaction.types';

type SupabaseErrorLike = {
  message?: string;
};

function assertSupabaseSuccess(error: SupabaseErrorLike | null, fallbackMessage: string) {
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
}

function asOptionalString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function mapTransaction(row: Record<string, unknown>): Transaction {
  const wallet = row.wallet as { name?: string } | null | undefined;
  const destinationWallet = row.destination_wallet as { name?: string } | null | undefined;
  const category = row.category as { name?: string } | null | undefined;

  return {
    id: String(row.id),
    workspace_id: String(row.workspace_id),
    type: row.type as Transaction['type'],
    financial_effect: String(row.financial_effect),
    title: String(row.title),
    amount: Number(row.amount ?? 0),
    transaction_date: String(row.transaction_date),
    wallet_id: asOptionalString(row.wallet_id),
    destination_wallet_id: asOptionalString(row.destination_wallet_id),
    category_id: asOptionalString(row.category_id),
    note: asOptionalString(row.note),
    created_at: String(row.created_at),
    wallet_name: wallet?.name ?? null,
    destination_wallet_name: destinationWallet?.name ?? null,
    category_name: category?.name ?? null
  };
}

function toInsertPayload(workspaceId: string, input: TransactionFormInput) {
  return {
    workspace_id: workspaceId,
    type: input.type,
    financial_effect: input.type,
    title: input.title,
    amount: input.amount,
    transaction_date: input.transactionDate,
    wallet_id: input.walletId || null,
    destination_wallet_id: input.type === 'transfer' ? input.destinationWalletId || null : null,
    category_id: input.type === 'transfer' ? null : input.categoryId || null,
    note: input.note || null,
    metadata: {}
  };
}

export const TransactionService = {
  async getTransactions(workspaceId: string, filters: TransactionFilterInput): Promise<Transaction[]> {
    let query = supabase
      .from('transactions')
      .select(
        'id, workspace_id, type, financial_effect, title, amount, transaction_date, wallet_id, destination_wallet_id, category_id, note, created_at, wallet:wallets!transactions_wallet_id_workspace_id_fkey(name), destination_wallet:wallets!transactions_destination_wallet_id_workspace_id_fkey(name), category:categories!transactions_category_id_workspace_id_fkey(name)'
      )
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    if (filters.dateFrom) {
      query = query.gte('transaction_date', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte('transaction_date', filters.dateTo);
    }

    if (filters.walletId) {
      query = query.or(`wallet_id.eq.${filters.walletId},destination_wallet_id.eq.${filters.walletId}`);
    }

    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    const { data, error } = (await query) as unknown as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil transaksi.');

    return (data ?? []).map(mapTransaction);
  },

  async getTransaction(transactionId: string): Promise<Transaction> {
    const { data, error } = (await supabase
      .from('transactions')
      .select(
        'id, workspace_id, type, financial_effect, title, amount, transaction_date, wallet_id, destination_wallet_id, category_id, note, created_at, wallet:wallets!transactions_wallet_id_workspace_id_fkey(name), destination_wallet:wallets!transactions_destination_wallet_id_workspace_id_fkey(name), category:categories!transactions_category_id_workspace_id_fkey(name)'
      )
      .eq('id', transactionId)
      .is('deleted_at', null)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil detail transaksi.');

    if (!data) {
      throw new Error('Transaksi tidak ditemukan.');
    }

    return mapTransaction(data);
  },

  async getWallets(workspaceId: string): Promise<TransactionReferenceWallet[]> {
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
      id: String(wallet.id),
      name: String(wallet.name),
      wallet_type: String(wallet.wallet_type)
    }));
  },

  async getCategories(workspaceId: string): Promise<TransactionReferenceCategory[]> {
    const { data, error } = (await supabase
      .from('categories')
      .select('id, name, type')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .eq('is_archived', false)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })) as unknown as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil kategori.');

    return (data ?? []).map((category) => ({
      id: String(category.id),
      name: String(category.name),
      type: category.type === 'income' ? 'income' : 'expense'
    }));
  },

  async createTransaction(workspaceId: string, input: TransactionFormInput): Promise<Transaction> {
    const { data, error } = (await supabase
      .from('transactions')
      .insert(toInsertPayload(workspaceId, input))
      .select(
        'id, workspace_id, type, financial_effect, title, amount, transaction_date, wallet_id, destination_wallet_id, category_id, note, created_at, wallet:wallets!transactions_wallet_id_workspace_id_fkey(name), destination_wallet:wallets!transactions_destination_wallet_id_workspace_id_fkey(name), category:categories!transactions_category_id_workspace_id_fkey(name)'
      )
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal membuat transaksi.');

    if (!data) {
      throw new Error('Transaksi tidak berhasil dibuat.');
    }

    return mapTransaction(data);
  },

  async updateTransaction(transactionId: string, workspaceId: string, input: TransactionFormInput): Promise<Transaction> {
    const { data, error } = (await supabase
      .from('transactions')
      .update(toInsertPayload(workspaceId, input))
      .eq('id', transactionId)
      .select(
        'id, workspace_id, type, financial_effect, title, amount, transaction_date, wallet_id, destination_wallet_id, category_id, note, created_at, wallet:wallets!transactions_wallet_id_workspace_id_fkey(name), destination_wallet:wallets!transactions_destination_wallet_id_workspace_id_fkey(name), category:categories!transactions_category_id_workspace_id_fkey(name)'
      )
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengubah transaksi.');

    if (!data) {
      throw new Error('Transaksi tidak ditemukan.');
    }

    return mapTransaction(data);
  },

  async deleteTransaction(transactionId: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .update({
        deleted_at: new Date().toISOString()
      })
      .eq('id', transactionId);

    assertSupabaseSuccess(error, 'Gagal menghapus transaksi.');
  }
};
