import { supabase } from '@/lib/supabase';
import type { DashboardSummary, DashboardTransaction } from '@features/dashboard/types/dashboard.types';

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
  title: string;
  amount: number | string;
  transaction_date: string;
  wallet_id: string | null;
  destination_wallet_id: string | null;
  category_id: string | null;
  created_at: string;
  wallet?: { name?: string } | null;
  destination_wallet?: { name?: string } | null;
  category?: { name?: string } | null;
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

function mapRecentTransaction(row: TransactionRow): DashboardTransaction {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    amount: Number(row.amount),
    transaction_date: row.transaction_date,
    wallet_name: row.wallet?.name ?? null,
    destination_wallet_name: row.destination_wallet?.name ?? null,
    category_name: row.category?.name ?? null
  };
}

export const DashboardService = {
  async getSummary(workspaceId: string): Promise<DashboardSummary> {
    const [wallets, transactions, recentTransactions] = await Promise.all([
      this.getActiveWallets(workspaceId),
      this.getTransactions(workspaceId),
      this.getRecentTransactions(workspaceId)
    ]);

    const walletBalance = new Map<string, number>();

    for (const wallet of wallets) {
      walletBalance.set(wallet.id, Number(wallet.initial_balance ?? 0));
    }

    const { end, start } = getMonthRange();
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    for (const transaction of transactions) {
      const amount = Number(transaction.amount);

      if (transaction.type === 'income' && transaction.wallet_id) {
        walletBalance.set(transaction.wallet_id, (walletBalance.get(transaction.wallet_id) ?? 0) + amount);

        if (transaction.transaction_date >= start && transaction.transaction_date <= end) {
          monthlyIncome += amount;
        }
      }

      if (transaction.type === 'expense' && transaction.wallet_id) {
        walletBalance.set(transaction.wallet_id, (walletBalance.get(transaction.wallet_id) ?? 0) - amount);

        if (transaction.transaction_date >= start && transaction.transaction_date <= end) {
          monthlyExpense += amount;
        }
      }

      if (transaction.type === 'transfer' && transaction.wallet_id && transaction.destination_wallet_id) {
        walletBalance.set(transaction.wallet_id, (walletBalance.get(transaction.wallet_id) ?? 0) - amount);
        walletBalance.set(
          transaction.destination_wallet_id,
          (walletBalance.get(transaction.destination_wallet_id) ?? 0) + amount
        );
      }

      if (transaction.type === 'adjustment' && transaction.wallet_id) {
        walletBalance.set(transaction.wallet_id, (walletBalance.get(transaction.wallet_id) ?? 0) + amount);
      }
    }

    const totalWalletBalance = Array.from(walletBalance.values()).reduce((total, value) => total + value, 0);

    return {
      totalWalletBalance,
      monthlyIncome,
      monthlyExpense,
      monthlyCashflow: monthlyIncome - monthlyExpense,
      activeWalletCount: wallets.length,
      recentTransactions
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

    assertSupabaseSuccess(error, 'Gagal mengambil wallet dashboard.');

    return data ?? [];
  },

  async getTransactions(workspaceId: string): Promise<TransactionRow[]> {
    const { data, error } = (await supabase
      .from('transactions')
      .select('id, type, title, amount, transaction_date, wallet_id, destination_wallet_id, category_id, created_at')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)) as unknown as {
      data: TransactionRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil transaksi dashboard.');

    return data ?? [];
  },

  async getRecentTransactions(workspaceId: string): Promise<DashboardTransaction[]> {
    const { data, error } = (await supabase
      .from('transactions')
      .select(
        'id, type, title, amount, transaction_date, wallet_id, destination_wallet_id, category_id, created_at, wallet:wallets!transactions_wallet_id_workspace_id_fkey(name), destination_wallet:wallets!transactions_destination_wallet_id_workspace_id_fkey(name), category:categories!transactions_category_id_workspace_id_fkey(name)'
      )
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5)) as unknown as {
      data: TransactionRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil transaksi terakhir.');

    return (data ?? []).map(mapRecentTransaction);
  }
};
