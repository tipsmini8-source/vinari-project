import type {
  debtSimulationSchema,
  expenseSimulationSchema,
  goalSavingSimulationSchema
} from '@features/decision-simulator/schemas/decision-simulator.schemas';
import type { z } from 'zod';

export type SimulationStatus = 'Aman' | 'Perlu Perhatian' | 'Berisiko';

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
  monthlyExpense: number;
  monthlyCashflow: number;
  activeDebtTotal: number;
  financialHealthScore: number;
  averageMonthlyExpense: number;
};

export type ExpenseSimulationInput = z.infer<typeof expenseSimulationSchema>;
export type DebtSimulationInput = z.infer<typeof debtSimulationSchema>;
export type GoalSavingSimulationInput = z.infer<typeof goalSavingSimulationSchema>;

export type ExpenseSimulationResult = {
  decisionName: string;
  estimatedBalanceAfter: number;
  cashflowImpactThisMonth: number;
  financialHealthBefore: number;
  financialHealthAfter: number;
  status: SimulationStatus;
  recommendation: string;
};

export type DebtSimulationResult = {
  debtName: string;
  additionalMonthlyObligation: number;
  estimatedDebtRatio: number | null;
  financialHealthBefore: number;
  financialHealthAfter: number;
  status: SimulationStatus;
  recommendation: string;
};

export type GoalSavingSimulationResult = {
  goalName: string;
  monthsToTargetBefore: number | null;
  monthsToTargetAfter: number | null;
  estimatedMonthsFaster: number | null;
  cashflowImpact: number;
  status: SimulationStatus;
  recommendation: string;
};
