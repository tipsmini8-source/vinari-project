import type { budgetSchema } from '@features/budget/schemas/budget.schemas';
import type { z } from 'zod';

export type BudgetFormInput = z.infer<typeof budgetSchema>;

export type BudgetStatus = 'safe' | 'warning' | 'over';

export type Budget = {
  id: string;
  workspace_id: string;
  category_id: string;
  name: string;
  amount: number;
  period: string;
  start_date: string;
  end_date: string;
  alert_percentage: number;
  is_active: boolean;
  created_at: string;
  category_name: string;
  category_type: 'expense' | 'income';
};

export type BudgetWithProgress = Budget & {
  spent_amount: number;
  remaining_amount: number;
  percentage: number;
  status: BudgetStatus;
};

export type BudgetReferenceCategory = {
  id: string;
  name: string;
  type: 'expense' | 'income';
};
