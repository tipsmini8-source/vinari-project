import { supabase } from '@/lib/supabase';
import type {
  FinancialHealthComponent,
  FinancialHealthScore,
  FinancialHealthStatus
} from '@features/financial-health/types/financial-health.types';

type SupabaseErrorLike = {
  message?: string;
};

type WalletRow = {
  id: string;
  initial_balance: number | string | null;
};

type TransactionRow = {
  type: 'income' | 'expense' | 'transfer' | 'adjustment';
  amount: number | string;
  transaction_date: string;
  wallet_id: string | null;
  destination_wallet_id: string | null;
};

type DebtRow = {
  remaining_amount: number | string;
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

type GoalRow = {
  current_amount: number | string;
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

function getStatus(score: number): FinancialHealthStatus {
  if (score >= 80) {
    return 'Sehat';
  }

  if (score >= 60) {
    return 'Cukup Sehat';
  }

  if (score >= 40) {
    return 'Perlu Perhatian';
  }

  return 'Berisiko';
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

function cashflowComponent(monthlyIncome: number, monthlyExpense: number): FinancialHealthComponent {
  const cashflow = monthlyIncome - monthlyExpense;

  if (cashflow > 0) {
    return {
      key: 'cashflow',
      label: 'Cashflow',
      score: 25,
      maxScore: 25,
      description: 'Income bulan ini lebih besar dari expense.'
    };
  }

  if (cashflow === 0) {
    return {
      key: 'cashflow',
      label: 'Cashflow',
      score: 15,
      maxScore: 25,
      description: 'Cashflow bulan ini seimbang.'
    };
  }

  return {
    key: 'cashflow',
    label: 'Cashflow',
    score: 5,
    maxScore: 25,
    description: 'Cashflow bulan ini negatif.'
  };
}

function debtComponent(activeDebtTotal: number, monthlyIncome: number): FinancialHealthComponent {
  if (activeDebtTotal <= 0) {
    return {
      key: 'debt',
      label: 'Debt',
      score: 25,
      maxScore: 25,
      description: 'Tidak ada hutang aktif.'
    };
  }

  const ratio = monthlyIncome > 0 ? activeDebtTotal / monthlyIncome : Number.POSITIVE_INFINITY;

  if (ratio <= 0.3) {
    return {
      key: 'debt',
      label: 'Debt',
      score: 20,
      maxScore: 25,
      description: 'Rasio hutang aktif terhadap income bulan ini maksimal 30%.'
    };
  }

  if (ratio <= 0.5) {
    return {
      key: 'debt',
      label: 'Debt',
      score: 12,
      maxScore: 25,
      description: 'Rasio hutang aktif terhadap income bulan ini maksimal 50%.'
    };
  }

  return {
    key: 'debt',
    label: 'Debt',
    score: 5,
    maxScore: 25,
    description: 'Rasio hutang aktif terhadap income bulan ini lebih dari 50%.'
  };
}

function budgetComponent(activeBudgetCount: number, warningCount: number, overCount: number): FinancialHealthComponent {
  if (activeBudgetCount === 0) {
    return {
      key: 'budget',
      label: 'Budget',
      score: 10,
      maxScore: 20,
      description: 'Belum ada budget aktif.'
    };
  }

  if (overCount > 0) {
    return {
      key: 'budget',
      label: 'Budget',
      score: 5,
      maxScore: 20,
      description: 'Ada budget yang sudah over budget.'
    };
  }

  if (warningCount > 0) {
    return {
      key: 'budget',
      label: 'Budget',
      score: 12,
      maxScore: 20,
      description: 'Ada budget yang hampir habis.'
    };
  }

  return {
    key: 'budget',
    label: 'Budget',
    score: 20,
    maxScore: 20,
    description: 'Tidak ada budget yang over atau hampir habis.'
  };
}

function goalComponent(activeGoalCount: number, goalWithProgressCount: number): FinancialHealthComponent {
  if (activeGoalCount === 0) {
    return {
      key: 'goal',
      label: 'Goal',
      score: 5,
      maxScore: 15,
      description: 'Belum ada goal aktif.'
    };
  }

  if (goalWithProgressCount > 0) {
    return {
      key: 'goal',
      label: 'Goal',
      score: 15,
      maxScore: 15,
      description: 'Ada goal aktif dengan progress berjalan.'
    };
  }

  return {
    key: 'goal',
    label: 'Goal',
    score: 8,
    maxScore: 15,
    description: 'Ada goal aktif, tetapi belum ada kontribusi.'
  };
}

function emergencyFundComponent(totalWalletBalance: number, monthlyExpense: number): FinancialHealthComponent {
  const months = monthlyExpense > 0 ? totalWalletBalance / monthlyExpense : null;

  if (months !== null && months >= 6) {
    return {
      key: 'emergencyFund',
      label: 'Emergency Fund',
      score: 15,
      maxScore: 15,
      description: 'Estimasi dana darurat minimal 6 bulan expense.'
    };
  }

  if (months !== null && months >= 3) {
    return {
      key: 'emergencyFund',
      label: 'Emergency Fund',
      score: 10,
      maxScore: 15,
      description: 'Estimasi dana darurat minimal 3 bulan expense.'
    };
  }

  if (months !== null && months >= 1) {
    return {
      key: 'emergencyFund',
      label: 'Emergency Fund',
      score: 5,
      maxScore: 15,
      description: 'Estimasi dana darurat minimal 1 bulan expense.'
    };
  }

  return {
    key: 'emergencyFund',
    label: 'Emergency Fund',
    score: 2,
    maxScore: 15,
    description: monthlyExpense > 0 ? 'Estimasi dana darurat kurang dari 1 bulan expense.' : 'Expense bulan ini belum cukup untuk estimasi dana darurat.'
  };
}

function buildRecommendations({
  activeDebtTotal,
  activeGoalCount,
  debtToIncomeRatio,
  emergencyFundMonths,
  monthlyCashflow
}: {
  activeDebtTotal: number;
  activeGoalCount: number;
  debtToIncomeRatio: number | null;
  emergencyFundMonths: number | null;
  monthlyCashflow: number;
}) {
  const recommendations: string[] = [];

  if (monthlyCashflow < 0) {
    recommendations.push('Cashflow negatif. Kurangi pengeluaran atau evaluasi kategori expense terbesar bulan ini.');
  }

  if (activeDebtTotal > 0 && (debtToIncomeRatio === null || debtToIncomeRatio > 0.5)) {
    recommendations.push('Rasio hutang tinggi. Fokuskan dana ekstra untuk pelunasan hutang aktif.');
  }

  if (activeGoalCount === 0) {
    recommendations.push('Belum ada goal aktif. Buat target keuangan agar tabungan lebih terarah.');
  }

  if (emergencyFundMonths === null || emergencyFundMonths < 3) {
    recommendations.push('Dana darurat masih rendah. Bangun saldo dana darurat minimal 3 bulan pengeluaran.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Kondisi keuangan terlihat stabil. Pertahankan cashflow positif dan review budget berkala.');
  }

  return recommendations;
}

export const FinancialHealthService = {
  async getScore(workspaceId: string): Promise<FinancialHealthScore> {
    const { end, start } = getMonthRange();
    const [wallets, allTransactions, monthTransactions, debts, budgets, goals] = await Promise.all([
      this.getActiveWallets(workspaceId),
      this.getTransactions(workspaceId),
      this.getTransactions(workspaceId, start, end),
      this.getActiveDebts(workspaceId),
      this.getActiveBudgets(workspaceId),
      this.getActiveGoals(workspaceId)
    ]);
    const monthlyIncome = monthTransactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((total, transaction) => total + Number(transaction.amount ?? 0), 0);
    const monthlyExpense = monthTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((total, transaction) => total + Number(transaction.amount ?? 0), 0);
    const monthlyCashflow = monthlyIncome - monthlyExpense;
    const activeDebtTotal = debts.reduce((total, debt) => total + Number(debt.remaining_amount ?? 0), 0);
    const debtToIncomeRatio = monthlyIncome > 0 ? activeDebtTotal / monthlyIncome : activeDebtTotal > 0 ? null : 0;
    const budgetUsage = await this.getBudgetUsage(workspaceId, budgets);
    const activeGoalCount = goals.length;
    const goalWithProgressCount = goals.filter((goal) => Number(goal.current_amount ?? 0) > 0).length;
    const totalWalletBalance = calculateWalletBalance(wallets, allTransactions);
    const averageMonthlyExpense = calculateAverageMonthlyExpense(allTransactions);
    const emergencyFundMonths = averageMonthlyExpense > 0 ? totalWalletBalance / averageMonthlyExpense : null;
    const components = [
      cashflowComponent(monthlyIncome, monthlyExpense),
      debtComponent(activeDebtTotal, monthlyIncome),
      budgetComponent(budgets.length, budgetUsage.warningCount, budgetUsage.overCount),
      goalComponent(activeGoalCount, goalWithProgressCount),
      emergencyFundComponent(totalWalletBalance, averageMonthlyExpense)
    ];
    const score = components.reduce((total, component) => total + component.score, 0);
    const recommendations = buildRecommendations({
      activeDebtTotal,
      activeGoalCount,
      debtToIncomeRatio,
      emergencyFundMonths,
      monthlyCashflow
    });

    return {
      score,
      status: getStatus(score),
      components,
      recommendations,
      primaryRecommendation: recommendations[0],
      metrics: {
        monthlyIncome,
        monthlyExpense,
        monthlyCashflow,
        activeDebtTotal,
        debtToIncomeRatio,
        activeBudgetCount: budgets.length,
        budgetWarningCount: budgetUsage.warningCount,
        budgetOverCount: budgetUsage.overCount,
        activeGoalCount,
        goalWithProgressCount,
        totalWalletBalance,
        averageMonthlyExpense,
        emergencyFundMonths
      }
    };
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

    assertSupabaseSuccess(error, 'Gagal mengambil wallet financial health.');

    return data ?? [];
  },

  async getTransactions(workspaceId: string, dateFrom?: string, dateTo?: string): Promise<TransactionRow[]> {
    let query = supabase
      .from('transactions')
      .select('type, amount, transaction_date, wallet_id, destination_wallet_id')
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

    assertSupabaseSuccess(error, 'Gagal mengambil transaksi financial health.');

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

    assertSupabaseSuccess(error, 'Gagal mengambil debt financial health.');

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

    assertSupabaseSuccess(error, 'Gagal mengambil budget financial health.');

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

    assertSupabaseSuccess(error, 'Gagal menghitung budget financial health.');

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
      .select('current_amount')
      .eq('workspace_id', workspaceId)
      .eq('status', 'active')
      .is('deleted_at', null)) as unknown as {
      data: GoalRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil goal financial health.');

    return data ?? [];
  }
};
