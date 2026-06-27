export type ReportFilterPreset = 'current_month' | 'previous_month' | 'custom';

export type ReportFilters = {
  preset: ReportFilterPreset;
  dateFrom: string;
  dateTo: string;
};

export type ReportCategoryBreakdown = {
  category_id: string | null;
  category_name: string;
  total: number;
  percentage: number;
};

export type ReportWalletSummary = {
  id: string;
  name: string;
  current_balance: number;
};

export type ReportNearestDebt = {
  id: string;
  name: string;
  due_date: string | null;
  remaining_amount: number;
} | null;

export type ReportSummary = {
  period: {
    dateFrom: string;
    dateTo: string;
  };
  monthly: {
    totalIncome: number;
    totalExpense: number;
    cashflow: number;
    savingRate: number;
  };
  expenseByCategory: ReportCategoryBreakdown[];
  incomeByCategory: ReportCategoryBreakdown[];
  wallets: ReportWalletSummary[];
  budget: {
    activeBudgetCount: number;
    totalBudget: number;
    totalUsed: number;
    overBudgetCount: number;
  };
  goal: {
    activeGoalCount: number;
    totalTarget: number;
    totalCollected: number;
    averageProgress: number;
  };
  debt: {
    activeDebtCount: number;
    totalRemainingDebt: number;
    nearestDebt: ReportNearestDebt;
  };
};
