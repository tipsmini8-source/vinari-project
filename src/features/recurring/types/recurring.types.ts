import type {
  RecurringTransactionFormInput,
  SubscriptionFormInput
} from '@features/recurring/schemas/recurring.schemas';

export type ScheduleCycle = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type RecurringTransactionType = 'income' | 'expense';

export type RecurringTransaction = {
  id: string;
  workspace_id: string;
  wallet_id: string | null;
  category_id: string | null;
  type: RecurringTransactionType;
  financial_effect: RecurringTransactionType;
  title: string;
  amount: number;
  frequency: ScheduleCycle;
  start_date: string;
  end_date: string | null;
  next_run_date: string;
  is_active: boolean;
  note: string | null;
  created_at: string;
  wallet_name: string | null;
  category_name: string | null;
};

export type Subscription = {
  id: string;
  workspace_id: string;
  wallet_id: string | null;
  category_id: string | null;
  name: string;
  amount: number;
  billing_cycle: ScheduleCycle;
  next_due_date: string;
  is_active: boolean;
  note: string | null;
  created_at: string;
  wallet_name: string | null;
  category_name: string | null;
};

export type RecurringReferenceWallet = {
  id: string;
  name: string;
  wallet_type: string;
};

export type RecurringReferenceCategory = {
  id: string;
  name: string;
  type: RecurringTransactionType;
};

export type RecurringTransactionSubmitInput = RecurringTransactionFormInput;
export type SubscriptionSubmitInput = SubscriptionFormInput;
