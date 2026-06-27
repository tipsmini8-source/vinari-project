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

export type DashboardSummary = {
  totalWalletBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyCashflow: number;
  activeWalletCount: number;
  recentTransactions: DashboardTransaction[];
};
