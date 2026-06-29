import type {
  debtSimulationSchema,
  expenseSimulationSchema,
  goalSavingSimulationSchema
} from '@features/decision-simulator/schemas/decision-simulator.schemas';
import type { z } from 'zod';

export type SimulationStatus = 'Aman' | 'Masih Bisa' | 'Perlu Dipikir Lagi' | 'Berisiko';
export type PaymentFrequency = 'daily' | 'weekly' | 'monthly';
export type InterestType = 'none' | 'flat';
export type InterestPeriod = 'total' | 'yearly' | 'monthly';
export type DebtCalculationMode = 'by_tenor' | 'by_payment';

export type SimulatorWallet = {
  id: string;
  name: string;
  current_balance: number;
};

export type SimulatorGoal = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  remaining_amount: number;
};

export type SimulatorSnapshot = {
  wallets: SimulatorWallet[];
  goals: SimulatorGoal[];
  monthlyIncome: number;
  averageMonthlyIncome: number;
  monthlyExpense: number;
  monthlyCashflow: number;
  activeDebtTotal: number;
  activeInstallmentMonthly: number;
  activeSubscriptionMonthly: number;
  activeBudgetTotal: number;
  totalBalance: number;
  financialHealthScore: number;
  averageMonthlyExpense: number;
};

export type ExpenseSimulationInput = z.infer<typeof expenseSimulationSchema>;
export type DebtSimulationInput = z.infer<typeof debtSimulationSchema>;
export type GoalSavingSimulationInput = z.infer<typeof goalSavingSimulationSchema>;

export type DebtInstallmentCalculation = {
  principalAmount: number;
  downPayment: number;
  principalAfterDownPayment: number;
  interestType: InterestType;
  interestPercent: number;
  interestPeriod: InterestPeriod;
  totalInterest: number;
  totalPayable: number;
  paymentPerPeriod: number;
  monthlyEquivalentPayment: number;
  totalPeriods: number;
  frequency: PaymentFrequency;
  payoffDate: string;
  durationLabel: string;
};

export type DecisionImpact = {
  incomeUsed: number;
  incomeDataAvailable: boolean;
  monthlyExpenseBefore: number;
  activeInstallmentMonthly: number;
  activeSubscriptionMonthly: number;
  newMonthlyPayment: number;
  totalInstallmentAfter: number;
  installmentToIncomeRatio: number | null;
  monthlyMoneyLeftAfter: number;
  totalDebtAfter: number;
  status: SimulationStatus;
  reason: string;
};

export type ResultDetail = {
  label: string;
  value: string;
};

export type ExpenseSimulationResult = {
  decisionName: string;
  paymentMode: 'one_time' | 'installment';
  walletName: string;
  walletBalanceBefore: number;
  walletBalanceAfter: number;
  totalBalanceAfter: number;
  monthlyExpenseAfter: number;
  monthlyCashflowAfter: number;
  debtCalculation?: DebtInstallmentCalculation;
  impact: DecisionImpact;
  status: SimulationStatus;
  recommendation: string;
  details: ResultDetail[];
};

export type DebtSimulationResult = {
  debtName: string;
  calculation: DebtInstallmentCalculation;
  impact: DecisionImpact;
  status: SimulationStatus;
  recommendation: string;
  details: ResultDetail[];
};

export type GoalSavingSimulationResult = {
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  remainingBefore: number;
  remainingAfter: number;
  monthsToTargetBefore: number | null;
  monthsToTargetAfter: number | null;
  estimatedMonthsFaster: number | null;
  monthlyImpact: number;
  status: SimulationStatus;
  recommendation: string;
  details: ResultDetail[];
};
