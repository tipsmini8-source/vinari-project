import { supabase } from '@/lib/supabase';
import type { FinancialInsight, InsightPriority } from '@features/insight/types/insight.types';

type SupabaseErrorLike = {
  message?: string;
};

type WalletRow = {
  id: string;
  initial_balance: number | string | null;
};

type CategoryRelation = {
  name?: string;
} | null;

type TransactionRow = {
  type: 'income' | 'expense' | 'transfer' | 'adjustment';
  amount: number | string;
  transaction_date: string;
  wallet_id: string | null;
  destination_wallet_id: string | null;
  category_id: string | null;
  category?: CategoryRelation;
};

type BudgetRow = {
  category_id: string;
  amount: number | string;
  start_date: string;
  end_date: string;
  alert_percentage: number | string;
};

type BudgetSpendRow = {
  amount: number | string;
  category_id: string;
  transaction_date: string;
};

type DebtRow = {
  remaining_amount: number | string;
};

type GoalRow = {
  target_amount: number | string;
  current_amount: number | string;
};

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  maximumFractionDigits: 0,
  style: 'currency'
});

const priorityOrder: Record<InsightPriority, number> = {
  high: 0,
  medium: 1,
  low: 2
};

function assertSupabaseSuccess(error: SupabaseErrorLike | null, fallbackMessage: string) {
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
}

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  };
}

function sortInsights(insights: FinancialInsight[]) {
  return [...insights].sort((first, second) => {
    const priorityDiff = priorityOrder[first.priority] - priorityOrder[second.priority];

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return first.title.localeCompare(second.title);
  });
}

function calculateWalletBalance(wallets: WalletRow[], transactions: TransactionRow[]) {
  const balances = new Map<string, number>();

  for (const wallet of wallets) {
    balances.set(wallet.id, Number(wallet.initial_balance ?? 0));
  }

  for (const transaction of transactions) {
    const amount = Number(transaction.amount ?? 0);

    if (transaction.type === 'income' && transaction.wallet_id && balances.has(transaction.wallet_id)) {
      balances.set(transaction.wallet_id, (balances.get(transaction.wallet_id) ?? 0) + amount);
    }

    if (transaction.type === 'expense' && transaction.wallet_id && balances.has(transaction.wallet_id)) {
      balances.set(transaction.wallet_id, (balances.get(transaction.wallet_id) ?? 0) - amount);
    }

    if (transaction.type === 'transfer' && transaction.wallet_id && transaction.destination_wallet_id) {
      if (balances.has(transaction.wallet_id)) {
        balances.set(transaction.wallet_id, (balances.get(transaction.wallet_id) ?? 0) - amount);
      }

      if (balances.has(transaction.destination_wallet_id)) {
        balances.set(transaction.destination_wallet_id, (balances.get(transaction.destination_wallet_id) ?? 0) + amount);
      }
    }
  }

  return Array.from(balances.values()).reduce((total, balance) => total + balance, 0);
}

function calculateAverageMonthlyExpense(transactions: TransactionRow[]) {
  const monthlyExpense = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.type !== 'expense') {
      continue;
    }

    const monthKey = transaction.transaction_date.slice(0, 7);
    monthlyExpense.set(monthKey, (monthlyExpense.get(monthKey) ?? 0) + Number(transaction.amount ?? 0));
  }

  if (monthlyExpense.size === 0) {
    return 0;
  }

  return Array.from(monthlyExpense.values()).reduce((total, value) => total + value, 0) / monthlyExpense.size;
}

function buildCashflowInsight(monthlyIncome: number, monthlyExpense: number): FinancialInsight {
  if (monthlyExpense > monthlyIncome) {
    return {
      id: 'cashflow-negative',
      type: 'danger',
      title: 'Cashflow negatif',
      message: 'Pengeluaran bulan ini lebih besar dari pemasukan.',
      action_label: 'Lihat laporan',
      action_url: '/app/reports',
      priority: 'high'
    };
  }

  if (monthlyIncome - monthlyExpense > 0) {
    return {
      id: 'cashflow-positive',
      type: 'positive',
      title: 'Cashflow positif',
      message: 'Cashflow bulan ini masih positif.',
      action_label: 'Lihat transaksi',
      action_url: '/app/transactions',
      priority: 'low'
    };
  }

  return {
    id: 'cashflow-even',
    type: 'info',
    title: 'Cashflow seimbang',
    message: 'Pemasukan dan pengeluaran bulan ini masih seimbang.',
    action_label: 'Lihat laporan',
    action_url: '/app/reports',
    priority: 'low'
  };
}

function buildExpenseInsight(expenseTransactions: TransactionRow[], totalExpense: number): FinancialInsight | null {
  if (totalExpense <= 0) {
    return null;
  }

  const categoryTotals = new Map<string, { name: string; total: number }>();

  for (const transaction of expenseTransactions) {
    const key = transaction.category_id ?? 'uncategorized';
    const current = categoryTotals.get(key);

    categoryTotals.set(key, {
      name: transaction.category?.name ?? 'Tanpa kategori',
      total: (current?.total ?? 0) + Number(transaction.amount ?? 0)
    });
  }

  const topCategory = Array.from(categoryTotals.values()).sort((first, second) => second.total - first.total)[0];

  if (!topCategory) {
    return null;
  }

  const percentage = Math.round((topCategory.total / totalExpense) * 100);
  const dominates = percentage > 40;

  return {
    id: 'expense-top-category',
    type: dominates ? 'warning' : 'info',
    title: 'Kategori expense terbesar',
    message: dominates
      ? `${topCategory.name} menyerap ${percentage}% dari total expense bulan ini. Kategori ini mendominasi pengeluaran bulan ini.`
      : `${topCategory.name} adalah kategori expense terbesar bulan ini (${percentage}%).`,
    action_label: 'Lihat reports',
    action_url: '/app/reports',
    priority: dominates ? 'medium' : 'low'
  };
}

function buildBudgetInsight(overCount: number, warningCount: number): FinancialInsight | null {
  if (overCount > 0) {
    return {
      id: 'budget-over',
      type: 'danger',
      title: 'Budget melewati batas',
      message: 'Ada budget yang sudah melewati batas.',
      action_label: 'Cek budget',
      action_url: '/app/budgets',
      priority: 'high'
    };
  }

  if (warningCount > 0) {
    return {
      id: 'budget-warning',
      type: 'warning',
      title: 'Budget hampir habis',
      message: 'Ada budget yang hampir habis.',
      action_label: 'Cek budget',
      action_url: '/app/budgets',
      priority: 'medium'
    };
  }

  return null;
}

function buildDebtInsight(totalDebt: number, monthlyIncome: number): FinancialInsight {
  if (totalDebt <= 0) {
    return {
      id: 'debt-none',
      type: 'positive',
      title: 'Tidak ada hutang aktif',
      message: 'Tidak ada hutang aktif saat ini.',
      action_label: 'Lihat debt',
      action_url: '/app/debts',
      priority: 'low'
    };
  }

  const ratio = monthlyIncome > 0 ? totalDebt / monthlyIncome : Number.POSITIVE_INFINITY;

  if (ratio > 0.5) {
    return {
      id: 'debt-high-ratio',
      type: 'warning',
      title: 'Rasio hutang tinggi',
      message: 'Rasio hutang perlu diperhatikan.',
      action_label: 'Kelola hutang',
      action_url: '/app/debts',
      priority: 'high'
    };
  }

  return {
    id: 'debt-active',
    type: 'info',
    title: 'Hutang aktif tercatat',
    message: `Total sisa hutang aktif saat ini ${moneyFormatter.format(totalDebt)}.`,
    action_label: 'Kelola hutang',
    action_url: '/app/debts',
    priority: 'medium'
  };
}

function buildGoalInsight(goals: GoalRow[]): FinancialInsight {
  if (goals.length === 0) {
    return {
      id: 'goal-none',
      type: 'info',
      title: 'Belum ada goal aktif',
      message: 'Kamu belum memiliki target keuangan aktif.',
      action_label: 'Buat goal',
      action_url: '/app/goals/new',
      priority: 'medium'
    };
  }

  const nearGoal = goals.some((goal) => {
    const targetAmount = Number(goal.target_amount ?? 0);
    const currentAmount = Number(goal.current_amount ?? 0);

    return targetAmount > 0 && currentAmount / targetAmount > 0.8;
  });

  if (nearGoal) {
    return {
      id: 'goal-nearly-achieved',
      type: 'positive',
      title: 'Goal hampir tercapai',
      message: 'Ada target yang hampir tercapai.',
      action_label: 'Lihat goals',
      action_url: '/app/goals',
      priority: 'medium'
    };
  }

  return {
    id: 'goal-active',
    type: 'positive',
    title: 'Goal aktif berjalan',
    message: 'Target keuangan aktif sudah tercatat. Pantau kontribusinya secara berkala.',
    action_label: 'Lihat goals',
    action_url: '/app/goals',
    priority: 'low'
  };
}

function buildEmergencyFundInsight(totalBalance: number, averageExpense: number): FinancialInsight | null {
  if (averageExpense <= 0) {
    return null;
  }

  if (totalBalance < averageExpense) {
    return {
      id: 'emergency-fund-low',
      type: 'warning',
      title: 'Dana darurat rendah',
      message: 'Dana darurat masih rendah.',
      action_label: 'Lihat wallets',
      action_url: '/app/wallets',
      priority: 'high'
    };
  }

  if (totalBalance >= averageExpense * 3) {
    return {
      id: 'emergency-fund-strong',
      type: 'positive',
      title: 'Dana darurat menguat',
      message: 'Dana darurat mulai cukup kuat.',
      action_label: 'Lihat reports',
      action_url: '/app/reports',
      priority: 'low'
    };
  }

  return {
    id: 'emergency-fund-progress',
    type: 'info',
    title: 'Dana darurat berkembang',
    message: 'Saldo aktif sudah melewati rata-rata expense bulanan, tetapi belum mencapai 3 bulan expense.',
    action_label: 'Lihat wallets',
    action_url: '/app/wallets',
    priority: 'medium'
  };
}

export const InsightService = {
  async getInsights(workspaceId: string): Promise<FinancialInsight[]> {
    const { end, start } = getMonthRange();
    const [wallets, allTransactions, monthTransactions, debts, budgets, goals] = await Promise.all([
      this.getActiveWallets(workspaceId),
      this.getTransactions(workspaceId),
      this.getTransactions(workspaceId, start, end),
      this.getActiveDebts(workspaceId),
      this.getActiveBudgets(workspaceId),
      this.getActiveGoals(workspaceId)
    ]);
    const incomeTransactions = monthTransactions.filter((transaction) => transaction.type === 'income');
    const expenseTransactions = monthTransactions.filter((transaction) => transaction.type === 'expense');
    const monthlyIncome = incomeTransactions.reduce((total, transaction) => total + Number(transaction.amount ?? 0), 0);
    const monthlyExpense = expenseTransactions.reduce((total, transaction) => total + Number(transaction.amount ?? 0), 0);
    const totalDebt = debts.reduce((total, debt) => total + Number(debt.remaining_amount ?? 0), 0);
    const budgetUsage = await this.getBudgetUsage(workspaceId, budgets);
    const totalBalance = calculateWalletBalance(wallets, allTransactions);
    const averageExpense = calculateAverageMonthlyExpense(allTransactions);
    const insights: FinancialInsight[] = [
      buildCashflowInsight(monthlyIncome, monthlyExpense),
      buildDebtInsight(totalDebt, monthlyIncome),
      buildGoalInsight(goals)
    ];
    const expenseInsight = buildExpenseInsight(expenseTransactions, monthlyExpense);
    const budgetInsight = buildBudgetInsight(budgetUsage.overCount, budgetUsage.warningCount);
    const emergencyFundInsight = buildEmergencyFundInsight(totalBalance, averageExpense);

    if (expenseInsight) {
      insights.push(expenseInsight);
    }

    if (budgetInsight) {
      insights.push(budgetInsight);
    }

    if (emergencyFundInsight) {
      insights.push(emergencyFundInsight);
    }

    return sortInsights(insights);
  },

  async getActiveWallets(workspaceId: string): Promise<WalletRow[]> {
    const { data, error } = (await supabase
      .from('wallets')
      .select('id, initial_balance')
      .eq('workspace_id', workspaceId)
      .eq('is_archived', false)
      .is('deleted_at', null)) as unknown as {
      data: WalletRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil wallet insight.');

    return data ?? [];
  },

  async getTransactions(workspaceId: string, dateFrom?: string, dateTo?: string): Promise<TransactionRow[]> {
    let query = supabase
      .from('transactions')
      .select(
        'type, amount, transaction_date, wallet_id, destination_wallet_id, category_id, category:categories!transactions_category_id_workspace_id_fkey(name)'
      )
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null);

    if (dateFrom) {
      query = query.gte('transaction_date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('transaction_date', dateTo);
    }

    const { data, error } = (await query) as unknown as {
      data: TransactionRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil transaksi insight.');

    return data ?? [];
  },

  async getActiveDebts(workspaceId: string): Promise<DebtRow[]> {
    const { data, error } = (await supabase
      .from('debts')
      .select('remaining_amount')
      .eq('workspace_id', workspaceId)
      .eq('status', 'active')
      .is('deleted_at', null)) as unknown as {
      data: DebtRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil debt insight.');

    return data ?? [];
  },

  async getActiveBudgets(workspaceId: string): Promise<BudgetRow[]> {
    const { data, error } = (await supabase
      .from('budgets')
      .select('category_id, amount, start_date, end_date, alert_percentage')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
      .is('deleted_at', null)) as unknown as {
      data: BudgetRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil budget insight.');

    return data ?? [];
  },

  async getBudgetUsage(workspaceId: string, budgets: BudgetRow[]) {
    if (budgets.length === 0) {
      return {
        overCount: 0,
        warningCount: 0
      };
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
      data: BudgetSpendRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal menghitung budget insight.');

    let overCount = 0;
    let warningCount = 0;

    for (const budget of budgets) {
      const spentAmount = (data ?? [])
        .filter(
          (transaction) =>
            transaction.category_id === budget.category_id &&
            transaction.transaction_date >= budget.start_date &&
            transaction.transaction_date <= budget.end_date
        )
        .reduce((total, transaction) => total + Number(transaction.amount ?? 0), 0);
      const percentage = Number(budget.amount) > 0 ? Math.round((spentAmount / Number(budget.amount)) * 100) : 0;

      if (percentage > 100) {
        overCount += 1;
      } else if (percentage >= Number(budget.alert_percentage ?? 80)) {
        warningCount += 1;
      }
    }

    return {
      overCount,
      warningCount
    };
  },

  async getActiveGoals(workspaceId: string): Promise<GoalRow[]> {
    const { data, error } = (await supabase
      .from('goals')
      .select('target_amount, current_amount')
      .eq('workspace_id', workspaceId)
      .eq('status', 'active')
      .is('deleted_at', null)) as unknown as {
      data: GoalRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil goal insight.');

    return data ?? [];
  }
};
