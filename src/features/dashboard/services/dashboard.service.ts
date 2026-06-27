import { supabase } from '@/lib/supabase';
import type { DashboardSummary, DashboardTransaction } from '@features/dashboard/types/dashboard.types';

type SupabaseErrorLike = {
  message?: string;
};

type WalletRow = {
  id: string;
  name: string;
  initial_balance: number | string | null;
};

type TransactionRow = {
  id: string;
  type: 'income' | 'expense' | 'transfer' | 'adjustment';
  title: string;
  amount: number | string;
  transaction_date: string;
  wallet_id: string | null;
  destination_wallet_id: string | null;
  category_id: string | null;
  created_at: string;
  wallet?: { name?: string } | null;
  destination_wallet?: { name?: string } | null;
  category?: { name?: string } | null;
};

type BudgetRow = {
  id: string;
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
  id: string;
  target_amount: number | string;
  current_amount: number | string;
  status: string;
};

type DebtRow = {
  id: string;
  name: string;
  remaining_amount: number | string;
  due_date: string | null;
  status: string;
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

function mapRecentTransaction(row: TransactionRow): DashboardTransaction {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    amount: Number(row.amount),
    transaction_date: row.transaction_date,
    wallet_name: row.wallet?.name ?? null,
    destination_wallet_name: row.destination_wallet?.name ?? null,
    category_name: row.category?.name ?? null
  };
}

export const DashboardService = {
  async getSummary(workspaceId: string): Promise<DashboardSummary> {
    const [wallets, transactions, recentTransactions, budgetSummary, goalSummary, debtSummary] = await Promise.all([
      this.getActiveWallets(workspaceId),
      this.getTransactions(workspaceId),
      this.getRecentTransactions(workspaceId),
      this.getBudgetSummary(workspaceId),
      this.getGoalSummary(workspaceId),
      this.getDebtSummary(workspaceId)
    ]);

    const walletBalance = new Map<string, number>();

    for (const wallet of wallets) {
      walletBalance.set(wallet.id, Number(wallet.initial_balance ?? 0));
    }

    const { end, start } = getMonthRange();
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    for (const transaction of transactions) {
      const amount = Number(transaction.amount);

      if (transaction.type === 'income' && transaction.wallet_id) {
        if (walletBalance.has(transaction.wallet_id)) {
          walletBalance.set(transaction.wallet_id, (walletBalance.get(transaction.wallet_id) ?? 0) + amount);
        }

        if (transaction.transaction_date >= start && transaction.transaction_date <= end) {
          monthlyIncome += amount;
        }
      }

      if (transaction.type === 'expense' && transaction.wallet_id) {
        if (walletBalance.has(transaction.wallet_id)) {
          walletBalance.set(transaction.wallet_id, (walletBalance.get(transaction.wallet_id) ?? 0) - amount);
        }

        if (transaction.transaction_date >= start && transaction.transaction_date <= end) {
          monthlyExpense += amount;
        }
      }

      if (transaction.type === 'transfer' && transaction.wallet_id && transaction.destination_wallet_id) {
        if (walletBalance.has(transaction.wallet_id)) {
          walletBalance.set(transaction.wallet_id, (walletBalance.get(transaction.wallet_id) ?? 0) - amount);
        }

        if (walletBalance.has(transaction.destination_wallet_id)) {
          walletBalance.set(
            transaction.destination_wallet_id,
            (walletBalance.get(transaction.destination_wallet_id) ?? 0) + amount
          );
        }
      }

    }

    const totalWalletBalance = Array.from(walletBalance.values()).reduce((total, value) => total + value, 0);

    return {
      totalWalletBalance,
      monthlyIncome,
      monthlyExpense,
      monthlyCashflow: monthlyIncome - monthlyExpense,
      activeWalletCount: wallets.length,
      activeBudgetCount: budgetSummary.activeBudgetCount,
      budgetWarningCount: budgetSummary.budgetWarningCount,
      budgetOverCount: budgetSummary.budgetOverCount,
      activeGoalCount: goalSummary.activeGoalCount,
      achievedGoalCount: goalSummary.achievedGoalCount,
      goalTargetTotal: goalSummary.goalTargetTotal,
      goalCurrentTotal: goalSummary.goalCurrentTotal,
      goalAverageProgress: goalSummary.goalAverageProgress,
      activeDebtCount: debtSummary.activeDebtCount,
      debtRemainingTotal: debtSummary.debtRemainingTotal,
      nearestDebt: debtSummary.nearestDebt,
      recentTransactions
    };
  },

  async getActiveWallets(workspaceId: string): Promise<WalletRow[]> {
    const { data, error } = (await supabase
      .from('wallets')
      .select('id, name, initial_balance')
      .eq('workspace_id', workspaceId)
      .eq('is_archived', false)
      .is('deleted_at', null)) as unknown as {
      data: WalletRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil wallet dashboard.');

    return data ?? [];
  },

  async getTransactions(workspaceId: string): Promise<TransactionRow[]> {
    const { data, error } = (await supabase
      .from('transactions')
      .select('id, type, title, amount, transaction_date, wallet_id, destination_wallet_id, category_id, created_at')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)) as unknown as {
      data: TransactionRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil transaksi dashboard.');

    return data ?? [];
  },

  async getRecentTransactions(workspaceId: string): Promise<DashboardTransaction[]> {
    const { data, error } = (await supabase
      .from('transactions')
      .select(
        'id, type, title, amount, transaction_date, wallet_id, destination_wallet_id, category_id, created_at, wallet:wallets!transactions_wallet_id_workspace_id_fkey(name), destination_wallet:wallets!transactions_destination_wallet_id_workspace_id_fkey(name), category:categories!transactions_category_id_workspace_id_fkey(name)'
      )
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5)) as unknown as {
      data: TransactionRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil transaksi terakhir.');

    return (data ?? []).map(mapRecentTransaction);
  },

  async getBudgetSummary(workspaceId: string) {
    const { data, error } = (await supabase
      .from('budgets')
      .select('id, category_id, amount, start_date, end_date, alert_percentage')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
      .is('deleted_at', null)) as unknown as {
      data: BudgetRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil ringkasan budget.');

    const budgets = data ?? [];

    if (budgets.length === 0) {
      return {
        activeBudgetCount: 0,
        budgetWarningCount: 0,
        budgetOverCount: 0
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
    const { data: transactions, error: transactionError } = (await supabase
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

    assertSupabaseSuccess(transactionError, 'Gagal menghitung pemakaian budget.');

    let budgetWarningCount = 0;
    let budgetOverCount = 0;

    for (const budget of budgets) {
      const spentAmount = (transactions ?? [])
        .filter(
          (transaction) =>
            transaction.category_id === budget.category_id &&
            transaction.transaction_date >= budget.start_date &&
            transaction.transaction_date <= budget.end_date
        )
        .reduce((total, transaction) => total + Number(transaction.amount ?? 0), 0);
      const percentage = Number(budget.amount) > 0 ? Math.round((spentAmount / Number(budget.amount)) * 100) : 0;

      if (percentage > 100) {
        budgetOverCount += 1;
      } else if (percentage >= Number(budget.alert_percentage ?? 80)) {
        budgetWarningCount += 1;
      }
    }

    return {
      activeBudgetCount: budgets.length,
      budgetWarningCount,
      budgetOverCount
    };
  },

  async getGoalSummary(workspaceId: string) {
    const { data, error } = (await supabase
      .from('goals')
      .select('id, target_amount, current_amount, status')
      .eq('workspace_id', workspaceId)
      .in('status', ['active', 'achieved'])
      .is('deleted_at', null)) as unknown as {
      data: GoalRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil ringkasan goal.');

    const goals = data ?? [];
    const activeGoals = goals.filter((goal) => goal.status === 'active');
    const achievedGoalCount = goals.filter((goal) => goal.status === 'achieved').length;
    const goalTargetTotal = activeGoals.reduce((total, goal) => total + Number(goal.target_amount ?? 0), 0);
    const goalCurrentTotal = activeGoals.reduce((total, goal) => total + Number(goal.current_amount ?? 0), 0);
    const goalAverageProgress =
      activeGoals.length > 0
        ? Math.round(
            activeGoals.reduce((total, goal) => {
              const targetAmount = Number(goal.target_amount ?? 0);
              const currentAmount = Number(goal.current_amount ?? 0);

              return total + (targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0);
            }, 0) / activeGoals.length
          )
        : 0;

    return {
      activeGoalCount: activeGoals.length,
      achievedGoalCount,
      goalTargetTotal,
      goalCurrentTotal,
      goalAverageProgress
    };
  },

  async getDebtSummary(workspaceId: string) {
    const { data, error } = (await supabase
      .from('debts')
      .select('id, name, remaining_amount, due_date, status')
      .eq('workspace_id', workspaceId)
      .eq('status', 'active')
      .is('deleted_at', null)) as unknown as {
      data: DebtRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil ringkasan hutang.');

    const debts = data ?? [];
    const nearestDebt =
      debts
        .filter((debt) => debt.due_date)
        .sort((first, second) => String(first.due_date).localeCompare(String(second.due_date)))[0] ?? null;

    return {
      activeDebtCount: debts.length,
      debtRemainingTotal: debts.reduce((total, debt) => total + Number(debt.remaining_amount ?? 0), 0),
      nearestDebt: nearestDebt
        ? {
            id: nearestDebt.id,
            name: nearestDebt.name,
            due_date: nearestDebt.due_date,
            remaining_amount: Number(nearestDebt.remaining_amount ?? 0)
          }
        : null
    };
  }
};
