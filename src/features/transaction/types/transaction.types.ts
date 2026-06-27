import type { transactionFilterSchema, transactionSchema } from '@features/transaction/schemas/transaction.schemas';
import type { z } from 'zod';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type TransactionFormInput = z.infer<typeof transactionSchema>;
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;

export type Transaction = {
  id: string;
  workspace_id: string;
  type: TransactionType;
  financial_effect: string;
  title: string;
  amount: number;
  transaction_date: string;
  wallet_id: string | null;
  destination_wallet_id: string | null;
  category_id: string | null;
  note: string | null;
  created_at: string;
  wallet_name: string | null;
  destination_wallet_name: string | null;
  category_name: string | null;
};

export type TransactionReferenceWallet = {
  id: string;
  name: string;
  wallet_type: string;
};

export type TransactionReferenceCategory = {
  id: string;
  name: string;
  type: 'income' | 'expense';
};
