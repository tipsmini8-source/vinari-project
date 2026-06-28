import { supabase } from '@/lib/supabase';
import type {
  Budget,
  BudgetFormInput,
  BudgetReferenceCategory,
  BudgetStatus,
  BudgetWithProgress
} from '@features/budget/types/budget.types';

type SupabaseErrorLike = {
  message?: string;
};

type TransactionSpendRow = {
  amount: number;
  category_id: string;
  transaction_date: string;
};

function assertSupabaseSuccess(error: SupabaseErrorLike | null, fallbackMessage: string) {
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function mapBudget(row: Record<string, unknown>): Budget {
  const category = row.category as { name?: string; type?: string } | null | undefined;

  return {
    id: asString(row.id),
    workspace_id: asString(row.workspace_id),
    category_id: asString(row.category_id),
    name: asString(row.name),
    amount: Number(row.amount ?? 0),
    period: asString(row.period, 'monthly'),
    start_date: asString(row.start_date),
    end_date: asString(row.end_date),
    alert_percentage: Number(row.alert_percentage ?? 80),
    is_active: Boolean(row.is_active),
    created_at: asString(row.created_at),
    category_name: category?.name ?? '-',
    category_type: category?.type === 'income' ? 'income' : 'expense'
  };
}

function toPayload(workspaceId: string, input: BudgetFormInput) {
  return {
    workspace_id: workspaceId,
    category_id: input.categoryId,
    name: input.name,
    amount: input.amount,
    period: 'monthly',
    start_date: input.startDate,
    end_date: input.endDate,
    alert_percentage: input.alertPercentage,
    is_active: input.isActive,
    metadata: {}
  };
}

function getStatus(percentage: number, alertPercentage: number): BudgetStatus {
  if (percentage > 100) {
    return 'over';
  }

  if (percentage >= alertPercentage) {
    return 'warning';
  }

  return 'safe';
}

function attachProgress(budgets: Budget[], transactions: TransactionSpendRow[]): BudgetWithProgress[] {
  return budgets.map((budget) => {
    const spentAmount = transactions
      .filter(
        (transaction) =>
          transaction.category_id === budget.category_id &&
          transaction.transaction_date >= budget.start_date &&
          transaction.transaction_date <= budget.end_date
      )
      .reduce((total, transaction) => total + transaction.amount, 0);
    const percentage = budget.amount > 0 ? Math.round((spentAmount / budget.amount) * 100) : 0;

    return {
      ...budget,
      spent_amount: spentAmount,
      remaining_amount: budget.amount - spentAmount,
      percentage,
      status: getStatus(percentage, budget.alert_percentage)
    };
  });
}

export const BudgetService = {
  async getBudgets(workspaceId: string): Promise<BudgetWithProgress[]> {
    const { data, error } = (await supabase
      .from('budgets')
      .select(
        'id, workspace_id, category_id, name, amount, period, start_date, end_date, alert_percentage, is_active, created_at, category:categories(name, type)'
      )
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .order('is_active', { ascending: false })
      .order('start_date', { ascending: false })
      .order('created_at', { ascending: false })) as unknown as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil daftar budget.');

    const budgets = (data ?? []).map(mapBudget);
    const transactions = await this.getExpenseTransactionsForBudgets(workspaceId, budgets);

    return attachProgress(budgets, transactions);
  },

  async getBudget(budgetId: string, workspaceId: string): Promise<BudgetWithProgress> {
    const { data, error } = (await supabase
      .from('budgets')
      .select(
        'id, workspace_id, category_id, name, amount, period, start_date, end_date, alert_percentage, is_active, created_at, category:categories(name, type)'
      )
      .eq('id', budgetId)
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil detail budget.');

    if (!data) {
      throw new Error('Budget tidak ditemukan.');
    }

    const budget = mapBudget(data);
    const transactions = await this.getExpenseTransactionsForBudgets(workspaceId, [budget]);

    return attachProgress([budget], transactions)[0];
  },

  async getExpenseCategories(workspaceId: string): Promise<BudgetReferenceCategory[]> {
    const { data, error } = (await supabase
      .from('categories')
      .select('id, name, type')
      .eq('workspace_id', workspaceId)
      .eq('type', 'expense')
      .eq('is_archived', false)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })) as unknown as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil kategori expense.');

    return (data ?? []).map((category) => ({
      id: asString(category.id),
      name: asString(category.name),
      type: 'expense'
    }));
  },

  async createBudget(workspaceId: string, input: BudgetFormInput): Promise<BudgetWithProgress> {
    await this.assertExpenseCategory(workspaceId, input.categoryId);

    const { data, error } = (await supabase
      .from('budgets')
      .insert(toPayload(workspaceId, input))
      .select(
        'id, workspace_id, category_id, name, amount, period, start_date, end_date, alert_percentage, is_active, created_at, category:categories(name, type)'
      )
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal membuat budget.');

    if (!data) {
      throw new Error('Budget tidak berhasil dibuat.');
    }

    return attachProgress([mapBudget(data)], [])[0];
  },

  async updateBudget(budgetId: string, workspaceId: string, input: BudgetFormInput): Promise<BudgetWithProgress> {
    await this.assertExpenseCategory(workspaceId, input.categoryId);

    const { data, error } = (await supabase
      .from('budgets')
      .update(toPayload(workspaceId, input))
      .eq('id', budgetId)
      .eq('workspace_id', workspaceId)
      .select(
        'id, workspace_id, category_id, name, amount, period, start_date, end_date, alert_percentage, is_active, created_at, category:categories(name, type)'
      )
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengubah budget.');

    if (!data) {
      throw new Error('Budget tidak ditemukan.');
    }

    const budget = mapBudget(data);
    const transactions = await this.getExpenseTransactionsForBudgets(workspaceId, [budget]);

    return attachProgress([budget], transactions)[0];
  },

  async deleteBudget(budgetId: string, workspaceId: string): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .update({
        deleted_at: new Date().toISOString(),
        is_active: false
      })
      .eq('id', budgetId)
      .eq('workspace_id', workspaceId);

    assertSupabaseSuccess(error, 'Gagal menghapus budget.');
  },

  async assertExpenseCategory(workspaceId: string, categoryId: string): Promise<void> {
    const { data, error } = (await supabase
      .from('categories')
      .select('id, type')
      .eq('id', categoryId)
      .eq('workspace_id', workspaceId)
      .eq('type', 'expense')
      .is('deleted_at', null)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Kategori expense tidak valid.');

    if (!data) {
      throw new Error('Budget hanya bisa dibuat untuk kategori expense.');
    }
  },

  async getExpenseTransactionsForBudgets(workspaceId: string, budgets: Budget[]): Promise<TransactionSpendRow[]> {
    if (budgets.length === 0) {
      return [];
    }

    const startDate = budgets.reduce(
      (earliest, budget) => (budget.start_date < earliest ? budget.start_date : earliest),
      budgets[0].start_date
    );
    const endDate = budgets.reduce(
      (latest, budget) => (budget.end_date > latest ? budget.end_date : latest),
      budgets[0].end_date
    );
    const categoryIds = Array.from(new Set(budgets.map((budget) => budget.category_id)));

    const { data, error } = (await supabase
      .from('transactions')
      .select('amount, category_id, transaction_date')
      .eq('workspace_id', workspaceId)
      .eq('type', 'expense')
      .in('category_id', categoryIds)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .is('deleted_at', null)) as unknown as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal menghitung progress budget.');

    return (data ?? []).map((transaction) => ({
      amount: Number(transaction.amount ?? 0),
      category_id: asString(transaction.category_id),
      transaction_date: asString(transaction.transaction_date)
    }));
  }
};
