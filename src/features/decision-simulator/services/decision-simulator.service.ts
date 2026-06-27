import { supabase } from '@/lib/supabase';
import { FinancialHealthService } from '@features/financial-health';
import type {
  DebtSimulationInput,
  DebtSimulationResult,
  ExpenseSimulationInput,
  ExpenseSimulationResult,
  GoalSavingSimulationInput,
  GoalSavingSimulationResult,
  SimulationStatus,
  SimulatorSnapshot,
  SimulatorWallet
} from '@features/decision-simulator/types/decision-simulator.types';

type SupabaseErrorLike = {
  message?: string;
};

type WalletRow = {
  id: string;
  name: string;
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

type GoalRow = {
  id: string;
  name: string;
  target_amount: number | string;
  current_amount: number | string;
  target_date: string | null;
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

function calculateWallets(wallets: WalletRow[], transactions: TransactionRow[]): SimulatorWallet[] {
  const walletMap = new Map<string, SimulatorWallet>();

  for (const wallet of wallets) {
    walletMap.set(wallet.id, {
      id: wallet.id,
      name: wallet.name,
      current_balance: Number(wallet.initial_balance ?? 0)
    });
  }

  for (const transaction of transactions) {
    const amount = Number(transaction.amount ?? 0);

    if (transaction.type === 'income' && transaction.wallet_id && walletMap.has(transaction.wallet_id)) {
      const wallet = walletMap.get(transaction.wallet_id);
      walletMap.set(transaction.wallet_id, {
        id: transaction.wallet_id,
        name: wallet?.name ?? '-',
        current_balance: (wallet?.current_balance ?? 0) + amount
      });
    }

    if (transaction.type === 'expense' && transaction.wallet_id && walletMap.has(transaction.wallet_id)) {
      const wallet = walletMap.get(transaction.wallet_id);
      walletMap.set(transaction.wallet_id, {
        id: transaction.wallet_id,
        name: wallet?.name ?? '-',
        current_balance: (wallet?.current_balance ?? 0) - amount
      });
    }

    if (transaction.type === 'transfer' && transaction.wallet_id && transaction.destination_wallet_id) {
      const sourceWallet = walletMap.get(transaction.wallet_id);
      const destinationWallet = walletMap.get(transaction.destination_wallet_id);

      if (sourceWallet) {
        walletMap.set(transaction.wallet_id, {
          ...sourceWallet,
          current_balance: sourceWallet.current_balance - amount
        });
      }

      if (destinationWallet) {
        walletMap.set(transaction.destination_wallet_id, {
          ...destinationWallet,
          current_balance: destinationWallet.current_balance + amount
        });
      }
    }
  }

  return Array.from(walletMap.values()).sort((first, second) => first.name.localeCompare(second.name));
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

function getSimulationStatus(scoreAfter: number, cashflowAfter: number, balanceAfter?: number): SimulationStatus {
  if (scoreAfter < 40 || cashflowAfter < 0 || (balanceAfter !== undefined && balanceAfter < 0)) {
    return 'Berisiko';
  }

  if (scoreAfter < 60 || cashflowAfter === 0 || (balanceAfter !== undefined && balanceAfter < 0.2 * Math.max(cashflowAfter, 1))) {
    return 'Perlu Perhatian';
  }

  return 'Aman';
}

function estimateHealthAfter(snapshot: SimulatorSnapshot, next: { debtTotal?: number; monthlyExpense?: number; walletBalance?: number }) {
  let score = snapshot.financialHealthScore;
  const nextCashflow = snapshot.monthlyIncome - (next.monthlyExpense ?? snapshot.monthlyExpense);
  const nextDebtRatio = snapshot.monthlyIncome > 0 ? (next.debtTotal ?? snapshot.activeDebtTotal) / snapshot.monthlyIncome : null;
  const nextEmergencyMonths =
    snapshot.averageMonthlyExpense > 0
      ? (next.walletBalance ?? snapshot.wallets.reduce((total, wallet) => total + wallet.current_balance, 0)) /
        snapshot.averageMonthlyExpense
      : null;

  if (nextCashflow < 0) {
    score -= 15;
  } else if (nextCashflow === 0) {
    score -= 8;
  }

  if (nextDebtRatio === null || nextDebtRatio > 0.5) {
    score -= 15;
  } else if (nextDebtRatio > 0.3) {
    score -= 8;
  }

  if (nextEmergencyMonths !== null && nextEmergencyMonths < 1) {
    score -= 10;
  } else if (nextEmergencyMonths !== null && nextEmergencyMonths < 3) {
    score -= 5;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function monthsToTarget(remainingAmount: number, monthlySaving: number) {
  if (remainingAmount <= 0) {
    return 0;
  }

  if (monthlySaving <= 0) {
    return null;
  }

  return Math.ceil(remainingAmount / monthlySaving);
}

export const DecisionSimulatorService = {
  async getSnapshot(workspaceId: string): Promise<SimulatorSnapshot> {
    const { end, start } = getMonthRange();
    const [walletRows, transactions, monthTransactions, debts, goals, health] = await Promise.all([
      this.getActiveWallets(workspaceId),
      this.getTransactions(workspaceId),
      this.getTransactions(workspaceId, start, end),
      this.getActiveDebts(workspaceId),
      this.getActiveGoals(workspaceId),
      FinancialHealthService.getScore(workspaceId)
    ]);
    const monthlyIncome = monthTransactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((total, transaction) => total + Number(transaction.amount ?? 0), 0);
    const monthlyExpense = monthTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((total, transaction) => total + Number(transaction.amount ?? 0), 0);

    return {
      wallets: calculateWallets(walletRows, transactions),
      goals: goals.map((goal) => {
        const targetAmount = Number(goal.target_amount ?? 0);
        const currentAmount = Number(goal.current_amount ?? 0);

        return {
          id: goal.id,
          name: goal.name,
          target_amount: targetAmount,
          current_amount: currentAmount,
          target_date: goal.target_date,
          remaining_amount: Math.max(targetAmount - currentAmount, 0)
        };
      }),
      monthlyIncome,
      monthlyExpense,
      monthlyCashflow: monthlyIncome - monthlyExpense,
      activeDebtTotal: debts.reduce((total, debt) => total + Number(debt.remaining_amount ?? 0), 0),
      financialHealthScore: health.score,
      averageMonthlyExpense: calculateAverageMonthlyExpense(transactions)
    };
  },

  simulateExpense(snapshot: SimulatorSnapshot, input: ExpenseSimulationInput): ExpenseSimulationResult {
    const wallet = snapshot.wallets.find((item) => item.id === input.walletId);

    if (!wallet) {
      throw new Error('Wallet tidak ditemukan.');
    }

    const monthlyImpact = input.paymentMode === 'installment' ? input.monthlyInstallment ?? 0 : input.amount;
    const estimatedBalanceAfter =
      input.paymentMode === 'installment' ? wallet.current_balance - monthlyImpact : wallet.current_balance - input.amount;
    const nextMonthlyExpense = snapshot.monthlyExpense + monthlyImpact;
    const financialHealthAfter = estimateHealthAfter(snapshot, {
      monthlyExpense: nextMonthlyExpense,
      walletBalance:
        snapshot.wallets.reduce((total, item) => total + item.current_balance, 0) -
        (input.paymentMode === 'installment' ? monthlyImpact : input.amount)
    });
    const cashflowImpactThisMonth = -monthlyImpact;
    const status = getSimulationStatus(financialHealthAfter, snapshot.monthlyCashflow + cashflowImpactThisMonth, estimatedBalanceAfter);

    return {
      decisionName: input.decisionName,
      estimatedBalanceAfter,
      cashflowImpactThisMonth,
      financialHealthBefore: snapshot.financialHealthScore,
      financialHealthAfter,
      status,
      recommendation:
        status === 'Aman'
          ? 'Keputusan ini masih terlihat aman terhadap cashflow dan saldo.'
          : status === 'Perlu Perhatian'
            ? 'Pertimbangkan menunda keputusan atau menurunkan nominal agar saldo tetap sehat.'
            : 'Keputusan ini berisiko. Cashflow atau saldo bisa tertekan setelah transaksi.'
    };
  },

  simulateDebt(snapshot: SimulatorSnapshot, input: DebtSimulationInput): DebtSimulationResult {
    const nextDebtTotal = snapshot.activeDebtTotal + input.totalDebt;
    const nextMonthlyExpense = snapshot.monthlyExpense + input.monthlyInstallment;
    const financialHealthAfter = estimateHealthAfter(snapshot, {
      debtTotal: nextDebtTotal,
      monthlyExpense: nextMonthlyExpense
    });
    const estimatedDebtRatio = snapshot.monthlyIncome > 0 ? nextDebtTotal / snapshot.monthlyIncome : null;
    const status = estimatedDebtRatio === null || estimatedDebtRatio > 0.5 || financialHealthAfter < 50 ? 'Berisiko' : 'Aman';

    return {
      debtName: input.debtName,
      additionalMonthlyObligation: input.monthlyInstallment,
      estimatedDebtRatio,
      financialHealthBefore: snapshot.financialHealthScore,
      financialHealthAfter,
      status,
      recommendation:
        status === 'Aman'
          ? 'Tambahan cicilan masih terlihat terkendali terhadap income bulan ini.'
          : 'Tambahan hutang membuat rasio hutang tinggi. Pertimbangkan tenor, nominal, atau tunda keputusan.'
    };
  },

  simulateGoalSaving(snapshot: SimulatorSnapshot, input: GoalSavingSimulationInput): GoalSavingSimulationResult {
    const goal = snapshot.goals.find((item) => item.id === input.goalId);

    if (!goal) {
      throw new Error('Goal tidak ditemukan.');
    }

    const baseMonthlySaving = goal.current_amount > 0 ? Math.max(snapshot.monthlyCashflow * 0.2, 0) : 0;
    const before = monthsToTarget(goal.remaining_amount, baseMonthlySaving);
    const after = monthsToTarget(goal.remaining_amount, baseMonthlySaving + input.additionalMonthlySaving);
    const cashflowImpact = -input.additionalMonthlySaving;
    const status = getSimulationStatus(
      snapshot.financialHealthScore,
      snapshot.monthlyCashflow + cashflowImpact
    );

    return {
      goalName: goal.name,
      monthsToTargetBefore: before,
      monthsToTargetAfter: after,
      estimatedMonthsFaster: before !== null && after !== null ? Math.max(before - after, 0) : null,
      cashflowImpact,
      status,
      recommendation:
        status === 'Aman'
          ? 'Tambahan tabungan ini masih aman dan bisa mempercepat target.'
          : 'Tambahan tabungan bagus, tetapi pastikan cashflow bulanan tetap positif.'
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

    assertSupabaseSuccess(error, 'Gagal mengambil wallet simulator.');

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

    assertSupabaseSuccess(error, 'Gagal mengambil transaksi simulator.');

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

    assertSupabaseSuccess(error, 'Gagal mengambil debt simulator.');

    return data ?? [];
  },

  async getActiveGoals(workspaceId: string): Promise<GoalRow[]> {
    const { data, error } = (await supabase
      .from('goals')
      .select('id, name, target_amount, current_amount, target_date')
      .eq('workspace_id', workspaceId)
      .eq('status', 'active')
      .is('deleted_at', null)) as unknown as {
      data: GoalRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil goal simulator.');

    return data ?? [];
  }
};
