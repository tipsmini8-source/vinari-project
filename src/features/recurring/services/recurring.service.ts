import { supabase } from '@/lib/supabase';
import type {
  RecurringReferenceCategory,
  RecurringReferenceWallet,
  RecurringTransaction,
  RecurringTransactionSubmitInput,
  RecurringTransactionType,
  ScheduleCycle,
  Subscription,
  SubscriptionSubmitInput
} from '@features/recurring/types/recurring.types';

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

function asScheduleCycle(value: unknown): ScheduleCycle {
  if (value === 'daily' || value === 'weekly' || value === 'yearly') {
    return value;
  }

  return 'monthly';
}

function asRecurringType(value: unknown): RecurringTransactionType {
  return value === 'income' ? 'income' : 'expense';
}

function mapRecurringTransaction(row: Record<string, unknown>): RecurringTransaction {
  const wallet = row.wallet as { name?: string } | null | undefined;
  const category = row.category as { name?: string } | null | undefined;
  const type = asRecurringType(row.type);

  return {
    id: asString(row.id),
    workspace_id: asString(row.workspace_id),
    wallet_id: asOptionalString(row.wallet_id),
    category_id: asOptionalString(row.category_id),
    type,
    financial_effect: asRecurringType(row.financial_effect ?? type),
    title: asString(row.title),
    amount: Number(row.amount ?? 0),
    frequency: asScheduleCycle(row.frequency),
    start_date: asString(row.start_date),
    end_date: asOptionalString(row.end_date),
    next_run_date: asString(row.next_run_date),
    is_active: Boolean(row.is_active),
    note: asOptionalString(row.note),
    created_at: asString(row.created_at),
    wallet_name: wallet?.name ?? null,
    category_name: category?.name ?? null
  };
}

function mapSubscription(row: Record<string, unknown>): Subscription {
  const wallet = row.wallet as { name?: string } | null | undefined;
  const category = row.category as { name?: string } | null | undefined;

  return {
    id: asString(row.id),
    workspace_id: asString(row.workspace_id),
    wallet_id: asOptionalString(row.wallet_id),
    category_id: asOptionalString(row.category_id),
    name: asString(row.name),
    amount: Number(row.amount ?? 0),
    billing_cycle: asScheduleCycle(row.billing_cycle),
    next_due_date: asString(row.next_due_date),
    is_active: Boolean(row.is_active),
    note: asOptionalString(row.note),
    created_at: asString(row.created_at),
    wallet_name: wallet?.name ?? null,
    category_name: category?.name ?? null
  };
}

function recurringPayload(workspaceId: string, input: RecurringTransactionSubmitInput) {
  return {
    workspace_id: workspaceId,
    wallet_id: input.walletId || null,
    category_id: input.categoryId || null,
    type: input.type,
    financial_effect: input.type,
    title: input.title,
    amount: input.amount,
    frequency: input.frequency,
    start_date: input.startDate,
    end_date: input.endDate || null,
    next_run_date: input.nextRunDate,
    is_active: input.isActive,
    note: input.note || null,
    metadata: {}
  };
}

function subscriptionPayload(workspaceId: string, input: SubscriptionSubmitInput) {
  return {
    workspace_id: workspaceId,
    wallet_id: input.walletId || null,
    category_id: input.categoryId || null,
    name: input.name,
    amount: input.amount,
    billing_cycle: input.billingCycle,
    next_due_date: input.nextDueDate,
    is_active: input.isActive,
    note: input.note || null,
    metadata: {}
  };
}

const recurringSelect =
  'id, workspace_id, wallet_id, category_id, type, financial_effect, title, amount, frequency, start_date, end_date, next_run_date, is_active, note, created_at, wallet:wallets(name), category:categories(name)';

const subscriptionSelect =
  'id, workspace_id, wallet_id, category_id, name, amount, billing_cycle, next_due_date, is_active, note, created_at, wallet:wallets(name), category:categories(name)';

export const RecurringService = {
  async getRecurringTransactions(workspaceId: string): Promise<RecurringTransaction[]> {
    const { data, error } = (await supabase
      .from('recurring_transactions')
      .select(recurringSelect)
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .order('is_active', { ascending: false })
      .order('next_run_date', { ascending: true })
      .order('created_at', { ascending: false })) as unknown as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil transaksi berulang.');

    return (data ?? []).map(mapRecurringTransaction);
  },

  async getRecurringTransaction(recurringId: string, workspaceId: string): Promise<RecurringTransaction> {
    const { data, error } = (await supabase
      .from('recurring_transactions')
      .select(recurringSelect)
      .eq('id', recurringId)
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil detail transaksi berulang.');

    if (!data) {
      throw new Error('Transaksi berulang tidak ditemukan.');
    }

    return mapRecurringTransaction(data);
  },

  async getSubscriptions(workspaceId: string): Promise<Subscription[]> {
    const { data, error } = (await supabase
      .from('subscriptions')
      .select(subscriptionSelect)
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .order('is_active', { ascending: false })
      .order('next_due_date', { ascending: true })
      .order('created_at', { ascending: false })) as unknown as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil subscription.');

    return (data ?? []).map(mapSubscription);
  },

  async getSubscription(subscriptionId: string, workspaceId: string): Promise<Subscription> {
    const { data, error } = (await supabase
      .from('subscriptions')
      .select(subscriptionSelect)
      .eq('id', subscriptionId)
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil detail subscription.');

    if (!data) {
      throw new Error('Subscription tidak ditemukan.');
    }

    return mapSubscription(data);
  },

  async getWallets(workspaceId: string): Promise<RecurringReferenceWallet[]> {
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

  async getCategories(workspaceId: string): Promise<RecurringReferenceCategory[]> {
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
      id: asString(category.id),
      name: asString(category.name),
      type: asRecurringType(category.type)
    }));
  },

  async createRecurringTransaction(
    workspaceId: string,
    input: RecurringTransactionSubmitInput
  ): Promise<RecurringTransaction> {
    await this.assertWallet(workspaceId, input.walletId);
    await this.assertCategory(workspaceId, input.categoryId, input.type);

    const { data, error } = (await supabase
      .from('recurring_transactions')
      .insert(recurringPayload(workspaceId, input))
      .select(recurringSelect)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal membuat transaksi berulang.');

    if (!data) {
      throw new Error('Transaksi berulang tidak berhasil dibuat.');
    }

    return mapRecurringTransaction(data);
  },

  async updateRecurringTransaction(
    recurringId: string,
    workspaceId: string,
    input: RecurringTransactionSubmitInput
  ): Promise<RecurringTransaction> {
    await this.assertWallet(workspaceId, input.walletId);
    await this.assertCategory(workspaceId, input.categoryId, input.type);

    const { data, error } = (await supabase
      .from('recurring_transactions')
      .update(recurringPayload(workspaceId, input))
      .eq('id', recurringId)
      .eq('workspace_id', workspaceId)
      .select(recurringSelect)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengubah transaksi berulang.');

    if (!data) {
      throw new Error('Transaksi berulang tidak ditemukan.');
    }

    return mapRecurringTransaction(data);
  },

  async deactivateRecurringTransaction(recurringId: string, workspaceId: string): Promise<void> {
    const { error } = await supabase
      .from('recurring_transactions')
      .update({ is_active: false })
      .eq('id', recurringId)
      .eq('workspace_id', workspaceId);

    assertSupabaseSuccess(error, 'Gagal menonaktifkan transaksi berulang.');
  },

  async deleteRecurringTransaction(recurringId: string, workspaceId: string): Promise<void> {
    const { error } = await supabase
      .from('recurring_transactions')
      .update({
        deleted_at: new Date().toISOString(),
        is_active: false
      })
      .eq('id', recurringId)
      .eq('workspace_id', workspaceId);

    assertSupabaseSuccess(error, 'Gagal menghapus transaksi berulang.');
  },

  async createSubscription(workspaceId: string, input: SubscriptionSubmitInput): Promise<Subscription> {
    if (input.walletId) {
      await this.assertWallet(workspaceId, input.walletId);
    }

    if (input.categoryId) {
      await this.assertCategory(workspaceId, input.categoryId, 'expense');
    }

    const { data, error } = (await supabase
      .from('subscriptions')
      .insert(subscriptionPayload(workspaceId, input))
      .select(subscriptionSelect)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal membuat subscription.');

    if (!data) {
      throw new Error('Subscription tidak berhasil dibuat.');
    }

    return mapSubscription(data);
  },

  async updateSubscription(
    subscriptionId: string,
    workspaceId: string,
    input: SubscriptionSubmitInput
  ): Promise<Subscription> {
    if (input.walletId) {
      await this.assertWallet(workspaceId, input.walletId);
    }

    if (input.categoryId) {
      await this.assertCategory(workspaceId, input.categoryId, 'expense');
    }

    const { data, error } = (await supabase
      .from('subscriptions')
      .update(subscriptionPayload(workspaceId, input))
      .eq('id', subscriptionId)
      .eq('workspace_id', workspaceId)
      .select(subscriptionSelect)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengubah subscription.');

    if (!data) {
      throw new Error('Subscription tidak ditemukan.');
    }

    return mapSubscription(data);
  },

  async deactivateSubscription(subscriptionId: string, workspaceId: string): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .update({ is_active: false })
      .eq('id', subscriptionId)
      .eq('workspace_id', workspaceId);

    assertSupabaseSuccess(error, 'Gagal menonaktifkan subscription.');
  },

  async deleteSubscription(subscriptionId: string, workspaceId: string): Promise<void> {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        deleted_at: new Date().toISOString(),
        is_active: false
      })
      .eq('id', subscriptionId)
      .eq('workspace_id', workspaceId);

    assertSupabaseSuccess(error, 'Gagal menghapus subscription.');
  },

  async assertWallet(workspaceId: string, walletId: string | undefined): Promise<void> {
    if (!walletId) {
      throw new Error('Wallet wajib dipilih.');
    }

    const { data, error } = (await supabase
      .from('wallets')
      .select('id')
      .eq('id', walletId)
      .eq('workspace_id', workspaceId)
      .eq('is_archived', false)
      .is('deleted_at', null)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Wallet tidak valid.');

    if (!data) {
      throw new Error('Wallet tidak valid.');
    }
  },

  async assertCategory(
    workspaceId: string,
    categoryId: string | undefined,
    type: RecurringTransactionType
  ): Promise<void> {
    if (!categoryId) {
      throw new Error('Kategori wajib dipilih.');
    }

    const { data, error } = (await supabase
      .from('categories')
      .select('id')
      .eq('id', categoryId)
      .eq('workspace_id', workspaceId)
      .eq('type', type)
      .eq('is_archived', false)
      .is('deleted_at', null)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Kategori tidak valid.');

    if (!data) {
      throw new Error('Kategori tidak valid untuk tipe transaksi ini.');
    }
  }
};
