import type { walletSchema } from '@features/wallet/schemas/wallet.schemas';
import type { z } from 'zod';

export type WalletFormInput = z.infer<typeof walletSchema>;

export type Wallet = {
  id: string;
  workspace_id: string;
  name: string;
  wallet_type: string;
  initial_balance: number;
  currency_code: string;
  icon: string | null;
  color: string | null;
  is_archived: boolean;
  created_at: string;
};

export type WalletDetail = Wallet & {
  current_balance: number;
  transaction_count: number;
};
