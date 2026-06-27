import type { goalContributionSchema, goalSchema } from '@features/goal/schemas/goal.schemas';
import type { z } from 'zod';

export type GoalStatus = 'active' | 'achieved' | 'cancelled';

export type GoalFormInput = z.infer<typeof goalSchema>;
export type GoalContributionFormInput = z.infer<typeof goalContributionSchema>;

export type Goal = {
  id: string;
  workspace_id: string;
  wallet_id: string | null;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  status: GoalStatus;
  icon: string | null;
  color: string | null;
  created_at: string;
  wallet_name: string | null;
};

export type GoalWithProgress = Goal & {
  remaining_amount: number;
  percentage: number;
};

export type GoalContribution = {
  id: string;
  workspace_id: string;
  goal_id: string;
  wallet_id: string | null;
  amount: number;
  contribution_date: string;
  note: string | null;
  created_at: string;
  wallet_name: string | null;
};

export type GoalReferenceWallet = {
  id: string;
  name: string;
  wallet_type: string;
};
