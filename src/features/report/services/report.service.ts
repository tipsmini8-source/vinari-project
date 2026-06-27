import { supabase } from '@/lib/supabase';
import type {
  ReportCategoryBreakdown,
  ReportFilters,
  ReportSummary,
  ReportWalletSummary
} from '@features/report/types/report.types';

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
  amount: number | string;
  transaction_date: string;
  wallet_id: string | null;
  destination_wallet_id: string | null;
  category_id: string | null;
  category?: { name?: string } | null;
};

type BudgetRow = {
  id: string;
  category_id: string;
  name: string;
  amount: number | string;
  start_date: string;
  end_date: string;
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

function uniqueCategoryKey(transaction: TransactionRow) {
  return transaction.category_id ?? 'uncategorized';
}

function calculateBreakdown(transactions: TransactionRow[], total: number): ReportCategoryBreakdown[] {
  const grouped = new Map<string, ReportCategoryBreakdown>();

  for (const transaction of transactions) {
    const key = uniqueCategoryKey(transaction);
    const current = grouped.get(key);

    grouped.set(key, {
      category_id: transaction.category_id,
      category_name: transaction.category?.name ?? 'Tanpa kategori',
      total: (current?.total ?? 0) + Number(transaction.amount ?? 0),
      percentage: 0
    });
  }

  return Array.from(grouped.values())
    .map((item) => ({
      ...item,
      percentage: total > 0 ? Math.round((item.total / total) * 100) : 0
    }))
    .sort((first, second) => second.total - first.total);
}

function calculateWalletBalances(wallets: WalletRow[], transactions: TransactionRow[]): ReportWalletSummary[] {
  const walletBalance = new Map<string, ReportWalletSummary>();

  for (const wallet of wallets) {
    walletBalance.set(wallet.id, {
      id: wallet.id,
      name: wallet.name,
      current_balance: Number(wallet.initial_balance ?? 0)
    });
  }

  for (const transaction of transactions) {
    const amount = Number(transaction.amount ?? 0);

    if (transaction.type === 'income' && transaction.wallet_id && walletBalance.has(transaction.wallet_id)) {
      const wallet = walletBalance.get(transaction.wallet_id);
      walletBalance.set(transaction.wallet_id, {
        id: transaction.wallet_id,
        name: wallet?.name ?? '-',
        current_balance: (wallet?.current_balance ?? 0) + amount
      });
    }

    if (transaction.type === 'expense' && transaction.wallet_id && walletBalance.has(transaction.wallet_id)) {
      const wallet = walletBalance.get(transaction.wallet_id);
      walletBalance.set(transaction.wallet_id, {
        id: transaction.wallet_id,
        name: wallet?.name ?? '-',
        current_balance: (wallet?.current_balance ?? 0) - amount
      });
    }

    if (transaction.type === 'transfer' && transaction.wallet_id && transaction.destination_wallet_id) {
      const sourceWallet = walletBalance.get(transaction.wallet_id);
      const destinationWallet = walletBalance.get(transaction.destination_wallet_id);

      if (sourceWallet) {
        walletBalance.set(transaction.wallet_id, {
          ...sourceWallet,
          current_balance: sourceWallet.current_balance - amount
        });
      }

      if (destinationWallet) {
        walletBalance.set(transaction.destination_wallet_id, {
          ...destinationWallet,
          current_balance: destinationWallet.current_balance + amount
        });
      }
    }
  }

  return Array.from(walletBalance.values()).sort((first, second) => first.name.localeCompare(second.name));
}

export const ReportService = {
  async getReport(workspaceId: string, filters: ReportFilters): Promise<ReportSummary> {
    const [periodTransactions, allTransactions, wallets, budget, goal, debt] = await Promise.all([
      this.getTransactions(workspaceId, filters.dateFrom, filters.dateTo),
      this.getTransactions(workspaceId),
      this.getWallets(workspaceId),
      this.getBudgetSummary(workspaceId),
      this.getGoalSummary(workspaceId),
      this.getDebtSummary(workspaceId)
    ]);
    const incomeTransactions = periodTransactions.filter((transaction) => transaction.type === 'income');
    const expenseTransactions = periodTransactions.filter((transaction) => transaction.type === 'expense');
    const totalIncome = incomeTransactions.reduce((total, transaction) => total + Number(transaction.amount ?? 0), 0);
    const totalExpense = expenseTransactions.reduce((total, transaction) => total + Number(transaction.amount ?? 0), 0);
    const cashflow = totalIncome - totalExpense;

    return {
      period: {
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      },
      monthly: {
        totalIncome,
        totalExpense,
        cashflow,
        savingRate: totalIncome > 0 ? Math.round((cashflow / totalIncome) * 100) : 0
      },
      expenseByCategory: calculateBreakdown(expenseTransactions, totalExpense),
      incomeByCategory: calculateBreakdown(incomeTransactions, totalIncome),
      wallets: calculateWalletBalances(wallets, allTransactions),
      budget,
      goal,
      debt
    };
  },

  async getWallets(workspaceId: string): Promise<WalletRow[]> {
    const { data, error } = (await supabase
      .from('wallets')
      .select('id, name, initial_balance')
      .eq('workspace_id', workspaceId)
      .eq('is_archived', false)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })) as unknown as {
      data: WalletRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil wallet laporan.');

    return data ?? [];
  },

  async getTransactions(workspaceId: string, dateFrom?: string, dateTo?: string): Promise<TransactionRow[]> {
    let query = supabase
      .from('transactions')
      .select(
        'id, type, amount, transaction_date, wallet_id, destination_wallet_id, category_id, category:categories!transactions_category_id_workspace_id_fkey(name)'
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

    assertSupabaseSuccess(error, 'Gagal mengambil transaksi laporan.');

    return data ?? [];
  },

  async getBudgetSummary(workspaceId: string): Promise<ReportSummary['budget']> {
    const { data, error } = (await supabase
      .from('budgets')
      .select('id, category_id, name, amount, start_date, end_date')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
      .is('deleted_at', null)) as unknown as {
      data: BudgetRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil budget laporan.');

    const budgets = data ?? [];

    if (budgets.length === 0) {
      return {
        activeBudgetCount: 0,
        totalBudget: 0,
        totalUsed: 0,
        overBudgetCount: 0
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

    assertSupabaseSuccess(transactionError, 'Gagal menghitung budget laporan.');

    let totalUsed = 0;
    let overBudgetCount = 0;

    for (const budget of budgets) {
      const used = (transactions ?? [])
        .filter(
          (transaction) =>
            transaction.category_id === budget.category_id &&
            transaction.transaction_date >= budget.start_date &&
            transaction.transaction_date <= budget.end_date
        )
        .reduce((total, transaction) => total + Number(transaction.amount ?? 0), 0);

      totalUsed += used;

      if (used > Number(budget.amount ?? 0)) {
        overBudgetCount += 1;
      }
    }

    return {
      activeBudgetCount: budgets.length,
      totalBudget: budgets.reduce((total, budget) => total + Number(budget.amount ?? 0), 0),
      totalUsed,
      overBudgetCount
    };
  },

  async getGoalSummary(workspaceId: string): Promise<ReportSummary['goal']> {
    const { data, error } = (await supabase
      .from('goals')
      .select('id, target_amount, current_amount, status')
      .eq('workspace_id', workspaceId)
      .eq('status', 'active')
      .is('deleted_at', null)) as unknown as {
      data: GoalRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil goal laporan.');

    const goals = data ?? [];
    const totalTarget = goals.reduce((total, goal) => total + Number(goal.target_amount ?? 0), 0);
    const totalCollected = goals.reduce((total, goal) => total + Number(goal.current_amount ?? 0), 0);

    return {
      activeGoalCount: goals.length,
      totalTarget,
      totalCollected,
      averageProgress:
        goals.length > 0
          ? Math.round(
              goals.reduce((total, goal) => {
                const targetAmount = Number(goal.target_amount ?? 0);
                const currentAmount = Number(goal.current_amount ?? 0);

                return total + (targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0);
              }, 0) / goals.length
            )
          : 0
    };
  },

  async getDebtSummary(workspaceId: string): Promise<ReportSummary['debt']> {
    const { data, error } = (await supabase
      .from('debts')
      .select('id, name, remaining_amount, due_date, status')
      .eq('workspace_id', workspaceId)
      .eq('status', 'active')
      .is('deleted_at', null)) as unknown as {
      data: DebtRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil debt laporan.');

    const debts = data ?? [];
    const nearestDebt =
      debts
        .filter((debt) => debt.due_date)
        .sort((first, second) => String(first.due_date).localeCompare(String(second.due_date)))[0] ?? null;

    return {
      activeDebtCount: debts.length,
      totalRemainingDebt: debts.reduce((total, debt) => total + Number(debt.remaining_amount ?? 0), 0),
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
