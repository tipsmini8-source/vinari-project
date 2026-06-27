export type FinancialHealthStatus = 'Sehat' | 'Cukup Sehat' | 'Perlu Perhatian' | 'Berisiko';

export type FinancialHealthComponentKey = 'cashflow' | 'debt' | 'budget' | 'goal' | 'emergencyFund';

export type FinancialHealthComponent = {
  key: FinancialHealthComponentKey;
  label: string;
  score: number;
  maxScore: number;
  description: string;
};

export type FinancialHealthScore = {
  score: number;
  status: FinancialHealthStatus;
  components: FinancialHealthComponent[];
  recommendations: string[];
  primaryRecommendation: string;
  metrics: {
    monthlyIncome: number;
    monthlyExpense: number;
    monthlyCashflow: number;
    activeDebtTotal: number;
    debtToIncomeRatio: number | null;
    activeBudgetCount: number;
    budgetWarningCount: number;
    budgetOverCount: number;
    activeGoalCount: number;
    goalWithProgressCount: number;
    totalWalletBalance: number;
    averageMonthlyExpense: number;
    emergencyFundMonths: number | null;
  };
};
