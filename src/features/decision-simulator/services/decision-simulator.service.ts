import { supabase } from '@/lib/supabase';
import { FinancialHealthService } from '@features/financial-health';
import type {
  DebtCalculationMode,
  DebtInstallmentCalculation,
  DebtSimulationInput,
  DebtSimulationResult,
  DecisionImpact,
  ExpenseSimulationInput,
  ExpenseSimulationResult,
  GoalSavingSimulationInput,
  GoalSavingSimulationResult,
  InterestPeriod,
  InterestType,
  PaymentFrequency,
  ResultDetail,
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
  installment_amount: number | string | null;
};

type GoalRow = {
  id: string;
  name: string;
  target_amount: number | string;
  current_amount: number | string;
  target_date: string | null;
};

type SubscriptionRow = {
  amount: number | string;
  billing_cycle: 'daily' | 'weekly' | 'monthly' | 'yearly';
};

type BudgetRow = {
  amount: number | string;
};

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  maximumFractionDigits: 0,
  style: 'currency'
});

const percentFormatter = new Intl.NumberFormat('id-ID', {
  maximumFractionDigits: 0,
  style: 'percent'
});

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
    end: end.toISOString().slice(0, 10),
    start: start.toISOString().slice(0, 10)
  };
}

function calculateWallets(wallets: WalletRow[], transactions: TransactionRow[]): SimulatorWallet[] {
  const walletMap = new Map<string, SimulatorWallet>();

  for (const wallet of wallets) {
    walletMap.set(wallet.id, {
      current_balance: Number(wallet.initial_balance ?? 0),
      id: wallet.id,
      name: wallet.name
    });
  }

  for (const transaction of transactions) {
    const amount = Number(transaction.amount ?? 0);

    if (transaction.type === 'income' && transaction.wallet_id && walletMap.has(transaction.wallet_id)) {
      const wallet = walletMap.get(transaction.wallet_id);
      walletMap.set(transaction.wallet_id, {
        current_balance: (wallet?.current_balance ?? 0) + amount,
        id: transaction.wallet_id,
        name: wallet?.name ?? '-'
      });
    }

    if (transaction.type === 'expense' && transaction.wallet_id && walletMap.has(transaction.wallet_id)) {
      const wallet = walletMap.get(transaction.wallet_id);
      walletMap.set(transaction.wallet_id, {
        current_balance: (wallet?.current_balance ?? 0) - amount,
        id: transaction.wallet_id,
        name: wallet?.name ?? '-'
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

function calculateAverageMonthly(transactions: TransactionRow[], type: 'income' | 'expense') {
  const monthlyValue = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.type !== type) {
      continue;
    }

    const monthKey = transaction.transaction_date.slice(0, 7);
    monthlyValue.set(monthKey, (monthlyValue.get(monthKey) ?? 0) + Number(transaction.amount ?? 0));
  }

  if (monthlyValue.size === 0) {
    return 0;
  }

  return Array.from(monthlyValue.values()).reduce((total, value) => total + value, 0) / monthlyValue.size;
}

function frequencyPeriodsToMonths(periods: number, frequency: PaymentFrequency) {
  if (frequency === 'daily') {
    return periods / 30;
  }

  if (frequency === 'weekly') {
    return periods / 4.345;
  }

  return periods;
}

function formatDuration(periods: number, frequency: PaymentFrequency) {
  if (frequency === 'daily') {
    return `${periods} hari`;
  }

  if (frequency === 'weekly') {
    return `${periods} minggu`;
  }

  return `${periods} bulan`;
}

export function getMonthlyEquivalentPayment(amount: number, frequency: PaymentFrequency) {
  if (frequency === 'daily') {
    return amount * 30;
  }

  if (frequency === 'weekly') {
    return amount * 4.345;
  }

  return amount;
}

function monthlyEquivalentFromCycle(amount: number, cycle: SubscriptionRow['billing_cycle']) {
  if (cycle === 'daily') {
    return amount * 30;
  }

  if (cycle === 'weekly') {
    return amount * 4.345;
  }

  if (cycle === 'yearly') {
    return amount / 12;
  }

  return amount;
}

export function calculateFlatInterest({
  interestPercent,
  interestPeriod,
  interestType,
  months,
  principal
}: {
  interestPercent: number;
  interestPeriod: InterestPeriod;
  interestType: InterestType;
  months: number;
  principal: number;
}) {
  if (interestType === 'none' || interestPercent <= 0) {
    return 0;
  }

  const rate = interestPercent / 100;

  if (interestPeriod === 'yearly') {
    return principal * rate * (months / 12);
  }

  if (interestPeriod === 'monthly') {
    return principal * rate * months;
  }

  return principal * rate;
}

export function estimatePayoffDate(startDate: string, periods: number, frequency: PaymentFrequency) {
  const date = new Date(startDate);

  if (Number.isNaN(date.getTime())) {
    return startDate;
  }

  if (frequency === 'daily') {
    date.setDate(date.getDate() + periods);
  } else if (frequency === 'weekly') {
    date.setDate(date.getDate() + periods * 7);
  } else {
    date.setMonth(date.getMonth() + periods);
  }

  return date.toISOString().slice(0, 10);
}

function buildCalculation({
  downPayment,
  frequency,
  interestPercent,
  interestPeriod,
  interestType,
  mode,
  paymentPerPeriod,
  startDate,
  tenurePeriods,
  totalAmount
}: {
  downPayment: number;
  frequency: PaymentFrequency;
  interestPercent: number;
  interestPeriod: InterestPeriod;
  interestType: InterestType;
  mode: DebtCalculationMode;
  paymentPerPeriod?: number;
  startDate: string;
  tenurePeriods?: number;
  totalAmount: number;
}): DebtInstallmentCalculation {
  const principalAfterDownPayment = Math.max(totalAmount - downPayment, 0);

  if (mode === 'by_tenor') {
    const totalPeriods = Math.max(tenurePeriods ?? 1, 1);
    const months = Math.max(frequencyPeriodsToMonths(totalPeriods, frequency), 1 / 30);
    const totalInterest = calculateFlatInterest({
      interestPercent,
      interestPeriod,
      interestType,
      months,
      principal: principalAfterDownPayment
    });
    const totalPayable = principalAfterDownPayment + totalInterest;
    const calculatedPayment = totalPayable / totalPeriods;

    return {
      downPayment,
      durationLabel: formatDuration(totalPeriods, frequency),
      frequency,
      interestPercent,
      interestPeriod,
      interestType,
      monthlyEquivalentPayment: getMonthlyEquivalentPayment(calculatedPayment, frequency),
      paymentPerPeriod: calculatedPayment,
      payoffDate: estimatePayoffDate(startDate, totalPeriods, frequency),
      principalAfterDownPayment,
      principalAmount: totalAmount,
      totalInterest,
      totalPayable,
      totalPeriods
    };
  }

  const safePayment = Math.max(paymentPerPeriod ?? 1, 1);
  let totalPeriods = Math.max(Math.ceil(principalAfterDownPayment / safePayment), 1);
  let totalInterest = 0;
  let totalPayable = principalAfterDownPayment;

  for (let index = 0; index < 20; index += 1) {
    const months = Math.max(frequencyPeriodsToMonths(totalPeriods, frequency), 1 / 30);
    totalInterest = calculateFlatInterest({
      interestPercent,
      interestPeriod,
      interestType,
      months,
      principal: principalAfterDownPayment
    });
    totalPayable = principalAfterDownPayment + totalInterest;
    const nextPeriods = Math.max(Math.ceil(totalPayable / safePayment), 1);

    if (nextPeriods === totalPeriods) {
      break;
    }

    totalPeriods = nextPeriods;
  }

  return {
    downPayment,
    durationLabel: formatDuration(totalPeriods, frequency),
    frequency,
    interestPercent,
    interestPeriod,
    interestType,
    monthlyEquivalentPayment: getMonthlyEquivalentPayment(safePayment, frequency),
    paymentPerPeriod: safePayment,
    payoffDate: estimatePayoffDate(startDate, totalPeriods, frequency),
    principalAfterDownPayment,
    principalAmount: totalAmount,
    totalInterest,
    totalPayable,
    totalPeriods
  };
}

export function calculateDebtInstallmentByTenor(input: {
  downPayment: number;
  frequency: PaymentFrequency;
  interestPercent: number;
  interestPeriod: InterestPeriod;
  interestType: InterestType;
  startDate: string;
  tenurePeriods: number;
  totalAmount: number;
}) {
  return buildCalculation({
    ...input,
    mode: 'by_tenor'
  });
}

export function calculateDebtPayoffDuration(input: {
  downPayment: number;
  frequency: PaymentFrequency;
  interestPercent: number;
  interestPeriod: InterestPeriod;
  interestType: InterestType;
  paymentPerPeriod: number;
  startDate: string;
  totalAmount: number;
}) {
  return buildCalculation({
    ...input,
    mode: 'by_payment'
  });
}

export function evaluateDecisionRisk({
  balanceAfter,
  newDebtAmount = 0,
  newMonthlyPayment,
  snapshot
}: {
  balanceAfter?: number;
  newDebtAmount?: number;
  newMonthlyPayment: number;
  snapshot: SimulatorSnapshot;
}): DecisionImpact {
  const incomeUsed = snapshot.monthlyIncome > 0 ? snapshot.monthlyIncome : snapshot.averageMonthlyIncome;
  const incomeDataAvailable = incomeUsed > 0;
  const totalInstallmentAfter = snapshot.activeInstallmentMonthly + newMonthlyPayment;
  const installmentToIncomeRatio = incomeDataAvailable ? totalInstallmentAfter / incomeUsed : null;
  const monthlyMoneyLeftAfter = incomeUsed - snapshot.monthlyExpense - newMonthlyPayment;
  const totalDebtAfter = snapshot.activeDebtTotal + newDebtAmount;
  let status: SimulationStatus = 'Aman';

  if (!incomeDataAvailable) {
    status = 'Perlu Dipikir Lagi';
  } else if (
    (installmentToIncomeRatio ?? 0) > 0.5 ||
    monthlyMoneyLeftAfter < 0 ||
    (balanceAfter !== undefined && balanceAfter < 0)
  ) {
    status = 'Berisiko';
  } else if ((installmentToIncomeRatio ?? 0) > 0.4 || monthlyMoneyLeftAfter < incomeUsed * 0.1) {
    status = 'Perlu Dipikir Lagi';
  } else if ((installmentToIncomeRatio ?? 0) > 0.3) {
    status = 'Masih Bisa';
  }

  const reason =
    !incomeDataAvailable
      ? 'Belum cukup data pemasukan untuk menilai kemampuan cicilan. Kalkulasi tetap ditampilkan sebagai perkiraan.'
      : status === 'Aman'
        ? 'Cicilan dan sisa uang bulanan masih terlihat terkendali.'
        : status === 'Masih Bisa'
          ? 'Masih memungkinkan, tapi cicilan mulai mengambil porsi cukup besar dari pemasukan.'
          : status === 'Perlu Dipikir Lagi'
            ? 'Sisa uang bulanan mulai tipis atau cicilan mulai besar dibanding pemasukan.'
            : 'Keputusan ini bisa membuat sisa uang bulanan negatif atau cicilan terlalu berat.';

  return {
    activeInstallmentMonthly: snapshot.activeInstallmentMonthly,
    activeSubscriptionMonthly: snapshot.activeSubscriptionMonthly,
    incomeDataAvailable,
    incomeUsed,
    installmentToIncomeRatio,
    monthlyExpenseBefore: snapshot.monthlyExpense,
    monthlyMoneyLeftAfter,
    newMonthlyPayment,
    reason,
    status,
    totalDebtAfter,
    totalInstallmentAfter
  };
}

function buildDebtCalculationFromInput(input: DebtSimulationInput | ExpenseSimulationInput, totalAmount: number, startDate: string) {
  const shared = {
    downPayment: input.downPayment ?? 0,
    frequency: input.frequency,
    interestPercent: input.interestType === 'none' ? 0 : input.interestPercent ?? 0,
    interestPeriod: input.interestPeriod,
    interestType: input.interestType,
    startDate,
    totalAmount
  };

  if (input.calculationMode === 'by_payment') {
    return calculateDebtPayoffDuration({
      ...shared,
      paymentPerPeriod: input.paymentPerPeriod ?? 1
    });
  }

  return calculateDebtInstallmentByTenor({
    ...shared,
    tenurePeriods: input.tenurePeriods ?? 1
  });
}

function recommendation(status: SimulationStatus, type: 'expense' | 'debt' | 'goal') {
  if (status === 'Aman') {
    return type === 'goal'
      ? 'Tambahan tabungan ini masih aman dan bisa mempercepat target.'
      : 'Keputusan ini masih terlihat aman untuk kondisi uang saat ini.';
  }

  if (status === 'Masih Bisa') {
    return 'Masih bisa dipertimbangkan, tapi beri ruang untuk kebutuhan mendadak.';
  }

  if (status === 'Perlu Dipikir Lagi') {
    return 'Pertimbangkan nominal, DP, atau lama cicilan agar tekanan bulanan lebih ringan.';
  }

  return 'Sebaiknya tunda atau cari opsi yang lebih ringan karena dampaknya cukup berisiko.';
}

function detailsFromCalculation(calculation: DebtInstallmentCalculation, snapshot: SimulatorSnapshot, impact: DecisionImpact): ResultDetail[] {
  return [
    { label: 'Pokok hutang', value: moneyFormatter.format(calculation.principalAmount) },
    { label: 'DP / uang muka', value: moneyFormatter.format(calculation.downPayment) },
    { label: 'Pokok setelah DP', value: moneyFormatter.format(calculation.principalAfterDownPayment) },
    {
      label: 'Bunga',
      value:
        calculation.interestType === 'none'
          ? 'Tanpa bunga'
          : `${calculation.interestPercent}% (${calculation.interestPeriod === 'total' ? 'total' : calculation.interestPeriod === 'yearly' ? 'per tahun' : 'per bulan'})`
    },
    { label: 'Total bunga', value: moneyFormatter.format(calculation.totalInterest) },
    { label: 'Total bayar', value: moneyFormatter.format(calculation.totalPayable) },
    { label: 'Lama cicilan', value: calculation.durationLabel },
    { label: 'Cicilan per periode', value: moneyFormatter.format(calculation.paymentPerPeriod) },
    { label: 'Setara cicilan bulanan', value: moneyFormatter.format(calculation.monthlyEquivalentPayment) },
    { label: 'Pemasukan yang dipakai', value: impact.incomeDataAvailable ? moneyFormatter.format(impact.incomeUsed) : 'Belum ada data' },
    { label: 'Uang keluar bulan ini', value: moneyFormatter.format(snapshot.monthlyExpense) },
    { label: 'Cicilan aktif saat ini', value: moneyFormatter.format(snapshot.activeInstallmentMonthly) },
    { label: 'Cicilan setelah simulasi', value: moneyFormatter.format(impact.totalInstallmentAfter) }
  ];
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

function savingMonthlyEquivalent(amount: number, frequency: GoalSavingSimulationInput['frequency']) {
  if (frequency === 'once') {
    return 0;
  }

  if (frequency === 'daily') {
    return amount * 30;
  }

  if (frequency === 'weekly') {
    return amount * 4.345;
  }

  return amount;
}

export function simulateLargeExpense(snapshot: SimulatorSnapshot, input: ExpenseSimulationInput): ExpenseSimulationResult {
  const wallet = snapshot.wallets.find((item) => item.id === input.walletId);

  if (!wallet) {
    throw new Error('Dompet tidak ditemukan.');
  }

  if (input.paymentMode === 'installment') {
    const calculation = buildDebtCalculationFromInput(input, input.amount, input.plannedDate);
    const walletBalanceAfter = wallet.current_balance - calculation.downPayment;
    const totalBalanceAfter = snapshot.totalBalance - calculation.downPayment;
    const impact = evaluateDecisionRisk({
      balanceAfter: walletBalanceAfter,
      newDebtAmount: calculation.principalAfterDownPayment,
      newMonthlyPayment: calculation.monthlyEquivalentPayment,
      snapshot
    });

    return {
      debtCalculation: calculation,
      decisionName: input.decisionName,
      details: [
        { label: 'Dompet yang dipakai', value: wallet.name },
        { label: 'Saldo dompet sebelum', value: moneyFormatter.format(wallet.current_balance) },
        { label: 'Saldo dompet setelah DP', value: moneyFormatter.format(walletBalanceAfter) },
        ...detailsFromCalculation(calculation, snapshot, impact)
      ],
      impact,
      monthlyCashflowAfter: snapshot.monthlyCashflow - calculation.monthlyEquivalentPayment,
      monthlyExpenseAfter: snapshot.monthlyExpense + calculation.monthlyEquivalentPayment,
      paymentMode: 'installment',
      recommendation: recommendation(impact.status, 'expense'),
      status: impact.status,
      totalBalanceAfter,
      walletBalanceAfter,
      walletBalanceBefore: wallet.current_balance,
      walletName: wallet.name
    };
  }

  const walletBalanceAfter = wallet.current_balance - input.amount;
  const totalBalanceAfter = snapshot.totalBalance - input.amount;
  const monthlyCashflowAfter = snapshot.monthlyCashflow - input.amount;
  const monthlyExpenseAfter = snapshot.monthlyExpense + input.amount;
  const status: SimulationStatus =
    walletBalanceAfter < 0 || monthlyCashflowAfter < 0
      ? 'Berisiko'
      : walletBalanceAfter < Math.max(snapshot.averageMonthlyExpense, 1)
        ? 'Perlu Dipikir Lagi'
        : 'Aman';
  const impact: DecisionImpact = {
    activeInstallmentMonthly: snapshot.activeInstallmentMonthly,
    activeSubscriptionMonthly: snapshot.activeSubscriptionMonthly,
    incomeDataAvailable: snapshot.monthlyIncome > 0 || snapshot.averageMonthlyIncome > 0,
    incomeUsed: snapshot.monthlyIncome > 0 ? snapshot.monthlyIncome : snapshot.averageMonthlyIncome,
    installmentToIncomeRatio:
      snapshot.monthlyIncome > 0 || snapshot.averageMonthlyIncome > 0
        ? snapshot.activeInstallmentMonthly / (snapshot.monthlyIncome > 0 ? snapshot.monthlyIncome : snapshot.averageMonthlyIncome)
        : null,
    monthlyExpenseBefore: snapshot.monthlyExpense,
    monthlyMoneyLeftAfter: monthlyCashflowAfter,
    newMonthlyPayment: 0,
    reason:
      status === 'Aman'
        ? 'Saldo dompet dan selisih uang bulan ini masih terlihat aman.'
        : status === 'Perlu Dipikir Lagi'
          ? 'Saldo setelah keputusan mulai tipis dibanding pengeluaran rutin.'
          : 'Saldo atau selisih uang bulan ini bisa menjadi negatif.',
    status,
    totalDebtAfter: snapshot.activeDebtTotal,
    totalInstallmentAfter: snapshot.activeInstallmentMonthly
  };

  return {
    decisionName: input.decisionName,
    details: [
      { label: 'Dompet yang dipakai', value: wallet.name },
      { label: 'Saldo dompet sebelum', value: moneyFormatter.format(wallet.current_balance) },
      { label: 'Nominal dibayar', value: moneyFormatter.format(input.amount) },
      { label: 'Saldo dompet setelah', value: moneyFormatter.format(walletBalanceAfter) },
      { label: 'Total saldo setelah', value: moneyFormatter.format(totalBalanceAfter) },
      { label: 'Uang keluar setelah simulasi', value: moneyFormatter.format(monthlyExpenseAfter) }
    ],
    impact,
    monthlyCashflowAfter,
    monthlyExpenseAfter,
    paymentMode: 'one_time',
    recommendation: recommendation(status, 'expense'),
    status,
    totalBalanceAfter,
    walletBalanceAfter,
    walletBalanceBefore: wallet.current_balance,
    walletName: wallet.name
  };
}

export function simulateSavingsGoal(snapshot: SimulatorSnapshot, input: GoalSavingSimulationInput): GoalSavingSimulationResult {
  const goal = snapshot.goals.find((item) => item.id === input.goalId);

  if (!goal) {
    throw new Error('Target tidak ditemukan.');
  }

  const baseMonthlySaving = Math.max(snapshot.monthlyCashflow * 0.2, 0);
  const monthlyImpact = savingMonthlyEquivalent(input.additionalSaving, input.frequency);
  const onceImpact = input.frequency === 'once' ? input.additionalSaving : 0;
  const remainingAfter = Math.max(goal.remaining_amount - onceImpact, 0);
  const before = monthsToTarget(goal.remaining_amount, baseMonthlySaving);
  const after = monthsToTarget(remainingAfter, baseMonthlySaving + monthlyImpact);
  const monthlyMoneyLeft = snapshot.monthlyCashflow - monthlyImpact;
  const status: SimulationStatus =
    monthlyImpact > 0 && monthlyMoneyLeft < 0
      ? 'Berisiko'
      : monthlyImpact > 0 && monthlyMoneyLeft < Math.max(snapshot.monthlyIncome * 0.1, 1)
        ? 'Perlu Dipikir Lagi'
        : 'Aman';

  return {
    currentAmount: goal.current_amount,
    details: [
      { label: 'Target', value: moneyFormatter.format(goal.target_amount) },
      { label: 'Sudah terkumpul', value: moneyFormatter.format(goal.current_amount) },
      { label: 'Sisa target sebelum', value: moneyFormatter.format(goal.remaining_amount) },
      { label: 'Sisa target setelah', value: moneyFormatter.format(remainingAfter) },
      { label: 'Tambahan rutin bulanan', value: moneyFormatter.format(monthlyImpact) },
      { label: 'Selisih uang setelah simulasi', value: moneyFormatter.format(monthlyMoneyLeft) }
    ],
    estimatedMonthsFaster: before !== null && after !== null ? Math.max(before - after, 0) : null,
    goalName: goal.name,
    monthlyImpact,
    monthsToTargetAfter: after,
    monthsToTargetBefore: before,
    recommendation: recommendation(status, 'goal'),
    remainingAfter,
    remainingBefore: goal.remaining_amount,
    status,
    targetAmount: goal.target_amount
  };
}

export const DecisionSimulatorService = {
  async getSnapshot(workspaceId: string): Promise<SimulatorSnapshot> {
    const { end, start } = getMonthRange();
    const [walletRows, transactions, monthTransactions, debts, goals, subscriptions, budgets, health] = await Promise.all([
      this.getActiveWallets(workspaceId),
      this.getTransactions(workspaceId),
      this.getTransactions(workspaceId, start, end),
      this.getActiveDebts(workspaceId),
      this.getActiveGoals(workspaceId),
      this.getActiveSubscriptions(workspaceId),
      this.getActiveBudgets(workspaceId),
      FinancialHealthService.getScore(workspaceId)
    ]);
    const wallets = calculateWallets(walletRows, transactions);
    const monthlyIncome = monthTransactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((total, transaction) => total + Number(transaction.amount ?? 0), 0);
    const monthlyExpense = monthTransactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((total, transaction) => total + Number(transaction.amount ?? 0), 0);
    const activeInstallmentMonthly = debts.reduce((total, debt) => total + Number(debt.installment_amount ?? 0), 0);
    const activeSubscriptionMonthly = subscriptions.reduce(
      (total, subscription) =>
        total + monthlyEquivalentFromCycle(Number(subscription.amount ?? 0), subscription.billing_cycle),
      0
    );

    return {
      activeBudgetTotal: budgets.reduce((total, budget) => total + Number(budget.amount ?? 0), 0),
      activeDebtTotal: debts.reduce((total, debt) => total + Number(debt.remaining_amount ?? 0), 0),
      activeInstallmentMonthly,
      activeSubscriptionMonthly,
      averageMonthlyExpense: calculateAverageMonthly(transactions, 'expense'),
      averageMonthlyIncome: calculateAverageMonthly(transactions, 'income'),
      financialHealthScore: health.score,
      goals: goals.map((goal) => {
        const targetAmount = Number(goal.target_amount ?? 0);
        const currentAmount = Number(goal.current_amount ?? 0);

        return {
          current_amount: currentAmount,
          id: goal.id,
          name: goal.name,
          remaining_amount: Math.max(targetAmount - currentAmount, 0),
          target_amount: targetAmount,
          target_date: goal.target_date
        };
      }),
      monthlyCashflow: monthlyIncome - monthlyExpense,
      monthlyExpense,
      monthlyIncome,
      totalBalance: wallets.reduce((total, wallet) => total + wallet.current_balance, 0),
      wallets
    };
  },

  simulateExpense(snapshot: SimulatorSnapshot, input: ExpenseSimulationInput): ExpenseSimulationResult {
    return simulateLargeExpense(snapshot, input);
  },

  simulateDebt(snapshot: SimulatorSnapshot, input: DebtSimulationInput): DebtSimulationResult {
    const calculation = buildDebtCalculationFromInput(input, input.totalDebt, input.startDate);
    const impact = evaluateDecisionRisk({
      newDebtAmount: calculation.principalAfterDownPayment,
      newMonthlyPayment: calculation.monthlyEquivalentPayment,
      snapshot
    });

    return {
      calculation,
      debtName: input.debtName,
      details: detailsFromCalculation(calculation, snapshot, impact),
      impact,
      recommendation: recommendation(impact.status, 'debt'),
      status: impact.status
    };
  },

  simulateGoalSaving(snapshot: SimulatorSnapshot, input: GoalSavingSimulationInput): GoalSavingSimulationResult {
    return simulateSavingsGoal(snapshot, input);
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
      .select('remaining_amount, installment_amount')
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
  },

  async getActiveSubscriptions(workspaceId: string): Promise<SubscriptionRow[]> {
    const { data, error } = (await supabase
      .from('subscriptions')
      .select('amount, billing_cycle')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
      .is('deleted_at', null)) as unknown as {
      data: SubscriptionRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil langganan simulator.');

    return data ?? [];
  },

  async getActiveBudgets(workspaceId: string): Promise<BudgetRow[]> {
    const { data, error } = (await supabase
      .from('budgets')
      .select('amount')
      .eq('workspace_id', workspaceId)
      .eq('is_active', true)
      .is('deleted_at', null)) as unknown as {
      data: BudgetRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil batas pengeluaran simulator.');

    return data ?? [];
  }
};

export { moneyFormatter, percentFormatter };
