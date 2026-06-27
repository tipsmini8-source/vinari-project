import type { debtPaymentSchema, debtSchema } from '@features/debt/schemas/debt.schemas';
import type { z } from 'zod';

export type DebtStatus = 'active' | 'paid' | 'cancelled';

export type DebtFormInput = z.infer<typeof debtSchema>;
export type DebtPaymentFormInput = z.infer<typeof debtPaymentSchema>;

export type Debt = {
  id: string;
  workspace_id: string;
  name: string;
  lender_name: string | null;
  principal_amount: number;
  remaining_amount: number;
  installment_amount: number | null;
  interest_rate: number;
  due_date: string | null;
  start_date: string | null;
  end_date: string | null;
  status: DebtStatus;
  note: string | null;
  created_at: string;
};

export type DebtWithProgress = Debt & {
  paid_amount: number;
  percentage: number;
};

export type DebtPayment = {
  id: string;
  workspace_id: string;
  debt_id: string;
  wallet_id: string | null;
  amount: number;
  payment_date: string;
  note: string | null;
  created_at: string;
  wallet_name: string | null;
};

export type DebtReferenceWallet = {
  id: string;
  name: string;
  wallet_type: string;
};
