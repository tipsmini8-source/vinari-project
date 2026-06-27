import type { FinancialHealthScore } from '@features/financial-health/types/financial-health.types';

export function isFinancialHealthDataEmpty(score: FinancialHealthScore) {
  return (
    score.metrics.monthlyIncome === 0 &&
    score.metrics.monthlyExpense === 0 &&
    score.metrics.totalWalletBalance === 0 &&
    score.metrics.activeBudgetCount === 0 &&
    score.metrics.activeGoalCount === 0 &&
    score.metrics.activeDebtTotal === 0
  );
}
