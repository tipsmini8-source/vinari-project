import { supabase } from '@/lib/supabase';
import type { Workspace } from '@/core/workspace';
import type { Wallet, WalletDetail, WalletFormInput } from '@features/wallet/types/wallet.types';

type SupabaseErrorLike = {
  message?: string;
};

function assertSupabaseSuccess(error: SupabaseErrorLike | null, fallbackMessage: string) {
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
}

function mapWallet(row: Record<string, unknown>): Wallet {
  return {
    id: String(row.id),
    workspace_id: String(row.workspace_id),
    name: String(row.name),
    wallet_type: String(row.wallet_type),
    initial_balance: Number(row.initial_balance ?? 0),
    currency_code: typeof row.currency_code === 'string' ? row.currency_code : 'IDR',
    icon: typeof row.icon === 'string' ? row.icon : null,
    color: typeof row.color === 'string' ? row.color : null,
    is_archived: Boolean(row.is_archived),
    created_at: String(row.created_at)
  };
}

export const WalletService = {
  async getWallets(workspaceId: string): Promise<Wallet[]> {
    const { data, error } = (await supabase
      .from('wallets')
      .select('id, workspace_id, name, wallet_type, initial_balance, currency_code, icon, color, is_archived, created_at')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })) as unknown as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil daftar wallet.');

    return (data ?? []).map(mapWallet);
  },

  async getWalletDetail(walletId: string): Promise<WalletDetail> {
    const { data, error } = (await supabase
      .from('wallets')
      .select('id, workspace_id, name, wallet_type, initial_balance, currency_code, icon, color, is_archived, created_at')
      .eq('id', walletId)
      .is('deleted_at', null)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil detail wallet.');

    if (!data) {
      throw new Error('Wallet tidak ditemukan.');
    }

    const wallet = mapWallet(data);
    const transactionCount = await this.getTransactionCount(walletId);

    return {
      ...wallet,
      current_balance: wallet.initial_balance,
      transaction_count: transactionCount
    };
  },

  async createWallet(workspace: Workspace, input: WalletFormInput): Promise<Wallet> {
    const { data, error } = (await supabase
      .from('wallets')
      .insert({
        workspace_id: workspace.id,
        name: input.name,
        wallet_type: input.walletType,
        initial_balance: input.initialBalance,
        opening_balance_date: new Date().toISOString().slice(0, 10),
        currency_code: workspace.currency_code,
        icon: input.icon,
        color: input.color,
        metadata: {}
      })
      .select('id, workspace_id, name, wallet_type, initial_balance, currency_code, icon, color, is_archived, created_at')
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal menambah wallet.');

    if (!data) {
      throw new Error('Wallet tidak berhasil dibuat.');
    }

    return mapWallet(data);
  },

  async updateWallet(walletId: string, input: WalletFormInput): Promise<Wallet> {
    const { data, error } = (await supabase
      .from('wallets')
      .update({
        name: input.name,
        wallet_type: input.walletType,
        initial_balance: input.initialBalance,
        icon: input.icon,
        color: input.color
      })
      .eq('id', walletId)
      .select('id, workspace_id, name, wallet_type, initial_balance, currency_code, icon, color, is_archived, created_at')
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengubah wallet.');

    if (!data) {
      throw new Error('Wallet tidak ditemukan.');
    }

    return mapWallet(data);
  },

  async archiveWallet(walletId: string): Promise<void> {
    const { error } = await supabase.from('wallets').update({ is_archived: true }).eq('id', walletId);
    assertSupabaseSuccess(error, 'Gagal mengarsipkan wallet.');
  },

  async deleteWallet(walletId: string): Promise<void> {
    const transactionCount = await this.getTransactionCount(walletId);

    if (transactionCount > 0) {
      throw new Error('Wallet tidak bisa dihapus karena sudah memiliki transaksi. Arsipkan wallet sebagai alternatif.');
    }

    const { error } = await supabase
      .from('wallets')
      .update({
        deleted_at: new Date().toISOString()
      })
      .eq('id', walletId);

    assertSupabaseSuccess(error, 'Gagal menghapus wallet.');
  },

  async getTransactionCount(walletId: string): Promise<number> {
    const { count, error } = await supabase
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .or(`wallet_id.eq.${walletId},destination_wallet_id.eq.${walletId}`)
      .is('deleted_at', null);

    assertSupabaseSuccess(error, 'Gagal memeriksa transaksi wallet.');

    return count ?? 0;
  }
};
