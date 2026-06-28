import { supabase } from '@/lib/supabase';
import type {
  Goal,
  GoalContribution,
  GoalContributionFormInput,
  GoalFormInput,
  GoalReferenceWallet,
  GoalStatus,
  GoalWithProgress
} from '@features/goal/types/goal.types';

type SupabaseErrorLike = {
  message?: string;
};

function assertSupabaseSuccess(error: SupabaseErrorLike | null, fallbackMessage: string) {
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asOptionalString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function asGoalStatus(value: unknown): GoalStatus {
  if (value === 'achieved' || value === 'cancelled') {
    return value;
  }

  return 'active';
}

function withProgress(goal: Goal): GoalWithProgress {
  const percentage = goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0;

  return {
    ...goal,
    remaining_amount: goal.target_amount - goal.current_amount,
    percentage
  };
}

function mapGoal(row: Record<string, unknown>): GoalWithProgress {
  const wallet = row.wallet as { name?: string } | null | undefined;
  const goal: Goal = {
    id: asString(row.id),
    workspace_id: asString(row.workspace_id),
    wallet_id: asOptionalString(row.wallet_id),
    name: asString(row.name),
    target_amount: Number(row.target_amount ?? 0),
    current_amount: Number(row.current_amount ?? 0),
    target_date: asOptionalString(row.target_date),
    status: asGoalStatus(row.status),
    icon: asOptionalString(row.icon),
    color: asOptionalString(row.color),
    created_at: asString(row.created_at),
    wallet_name: wallet?.name ?? null
  };

  return withProgress(goal);
}

function mapContribution(row: Record<string, unknown>): GoalContribution {
  const wallet = row.wallet as { name?: string } | null | undefined;

  return {
    id: asString(row.id),
    workspace_id: asString(row.workspace_id),
    goal_id: asString(row.goal_id),
    wallet_id: asOptionalString(row.wallet_id),
    amount: Number(row.amount ?? 0),
    contribution_date: asString(row.contribution_date),
    note: asOptionalString(row.note),
    created_at: asString(row.created_at),
    wallet_name: wallet?.name ?? null
  };
}

function toGoalPayload(workspaceId: string, input: GoalFormInput) {
  const resolvedStatus = input.currentAmount >= input.targetAmount ? 'achieved' : input.status;

  return {
    workspace_id: workspaceId,
    wallet_id: input.walletId || null,
    name: input.name,
    target_amount: input.targetAmount,
    current_amount: input.currentAmount,
    target_date: input.targetDate || null,
    status: resolvedStatus,
    icon: input.icon || null,
    color: input.color || null,
    metadata: {}
  };
}

const goalSelect =
  'id, workspace_id, wallet_id, name, target_amount, current_amount, target_date, status, icon, color, created_at, wallet:wallets(name)';

export const GoalService = {
  async getGoals(workspaceId: string): Promise<GoalWithProgress[]> {
    const { data, error } = (await supabase
      .from('goals')
      .select(goalSelect)
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .order('status', { ascending: true })
      .order('target_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })) as unknown as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil daftar goal.');

    return (data ?? []).map(mapGoal);
  },

  async getGoal(goalId: string, workspaceId: string): Promise<GoalWithProgress> {
    const { data, error } = (await supabase
      .from('goals')
      .select(goalSelect)
      .eq('id', goalId)
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil detail goal.');

    if (!data) {
      throw new Error('Goal tidak ditemukan.');
    }

    return mapGoal(data);
  },

  async getContributions(goalId: string, workspaceId: string): Promise<GoalContribution[]> {
    const { data, error } = (await supabase
      .from('goal_contributions')
      .select('id, workspace_id, goal_id, wallet_id, amount, contribution_date, note, created_at, wallet:wallets(name)')
      .eq('goal_id', goalId)
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .order('contribution_date', { ascending: false })
      .order('created_at', { ascending: false })) as unknown as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil riwayat kontribusi.');

    return (data ?? []).map(mapContribution);
  },

  async getWallets(workspaceId: string): Promise<GoalReferenceWallet[]> {
    const { data, error } = (await supabase
      .from('wallets')
      .select('id, name, wallet_type')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .eq('is_archived', false)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })) as unknown as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil wallet.');

    return (data ?? []).map((wallet) => ({
      id: asString(wallet.id),
      name: asString(wallet.name),
      wallet_type: asString(wallet.wallet_type)
    }));
  },

  async createGoal(workspaceId: string, input: GoalFormInput): Promise<GoalWithProgress> {
    const { data, error } = (await supabase
      .from('goals')
      .insert(toGoalPayload(workspaceId, input))
      .select(goalSelect)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal membuat goal.');

    if (!data) {
      throw new Error('Goal tidak berhasil dibuat.');
    }

    return mapGoal(data);
  },

  async updateGoal(goalId: string, workspaceId: string, input: GoalFormInput): Promise<GoalWithProgress> {
    const { data, error } = (await supabase
      .from('goals')
      .update(toGoalPayload(workspaceId, input))
      .eq('id', goalId)
      .eq('workspace_id', workspaceId)
      .select(goalSelect)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengubah goal.');

    if (!data) {
      throw new Error('Goal tidak ditemukan.');
    }

    return mapGoal(data);
  },

  async deleteGoal(goalId: string, workspaceId: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .update({
        deleted_at: new Date().toISOString(),
        status: 'cancelled'
      })
      .eq('id', goalId)
      .eq('workspace_id', workspaceId);

    assertSupabaseSuccess(error, 'Gagal menghapus goal.');
  },

  async addContribution(
    goalId: string,
    workspaceId: string,
    input: GoalContributionFormInput
  ): Promise<GoalContribution> {
    await this.getGoal(goalId, workspaceId);

    const { data, error } = (await supabase
      .from('goal_contributions')
      .insert({
        workspace_id: workspaceId,
        goal_id: goalId,
        wallet_id: input.walletId || null,
        amount: input.amount,
        contribution_date: input.contributionDate,
        note: input.note || null,
        metadata: {}
      })
      .select('id, workspace_id, goal_id, wallet_id, amount, contribution_date, note, created_at, wallet:wallets(name)')
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal menambah kontribusi.');

    if (!data) {
      throw new Error('Kontribusi tidak berhasil dibuat.');
    }

    return mapContribution(data);
  }
};
