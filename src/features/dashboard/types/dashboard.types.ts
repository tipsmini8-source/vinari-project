export type DashboardTransaction = {
  id: string;
  type: 'income' | 'expense' | 'transfer' | 'adjustment';
  title: string;
  amount: number;
  transaction_date: string;
  wallet_name: string | null;
  destination_wallet_name: string | null;
  category_name: string | null;
};

export type DashboardNearestDebt = {
  id: string;
  name: string;
  due_date: string | null;
  remaining_amount: number;
} | null;

export type DashboardWalletBalance = {
  id: string;
  name: string;
  current_balance: number;
};

export type DashboardSummary = {
  totalWalletBalance: number;
  walletBalances: DashboardWalletBalance[];
  dailyIncome: number;
  dailyExpense: number;
  dailyCashflow: number;
  weeklyIncome: number;
  weeklyExpense: number;
  weeklyCashflow: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyCashflow: number;
  activeWalletCount: number;
  activeBudgetCount: number;
  budgetWarningCount: number;
  budgetOverCount: number;
  activeGoalCount: number;
  achievedGoalCount: number;
  goalTargetTotal: number;
  goalCurrentTotal: number;
  goalAverageProgress: number;
  activeDebtCount: number;
  debtRemainingTotal: number;
  nearestDebt: DashboardNearestDebt;
  recentTransactions: DashboardTransaction[];
};
