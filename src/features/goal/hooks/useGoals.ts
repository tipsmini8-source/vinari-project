import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { GoalService } from '@features/goal/services/goal.service';
import type { GoalContributionFormInput, GoalFormInput } from '@features/goal/types/goal.types';

export const goalKeys = {
  list: (workspaceId: string | undefined) => ['goals', workspaceId] as const,
  detail: (goalId: string | undefined) => ['goal', goalId] as const,
  contributions: (goalId: string | undefined) => ['goal-contributions', goalId] as const,
  wallets: (workspaceId: string | undefined) => ['goal-wallets', workspaceId] as const
};

export function useGoals(workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: goalKeys.list(workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        return [];
      }

      return GoalService.getGoals(workspaceId);
    }
  });
}

export function useGoal(goalId: string | undefined) {
  return useQuery({
    enabled: Boolean(goalId),
    queryKey: goalKeys.detail(goalId),
    queryFn: () => {
      if (!goalId) {
        throw new Error('Goal belum dipilih.');
      }

      return GoalService.getGoal(goalId);
    }
  });
}

export function useGoalContributions(goalId: string | undefined) {
  return useQuery({
    enabled: Boolean(goalId),
    queryKey: goalKeys.contributions(goalId),
    queryFn: () => {
      if (!goalId) {
        return [];
      }

      return GoalService.getContributions(goalId);
    }
  });
}

export function useGoalWallets(workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: goalKeys.wallets(workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        return [];
      }

      return GoalService.getWallets(workspaceId);
    }
  });
}

export function useCreateGoal(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GoalFormInput) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return GoalService.createGoal(workspaceId, input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: goalKeys.list(workspaceId) });
    }
  });
}

export function useUpdateGoal(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, input }: { goalId: string; input: GoalFormInput }) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return GoalService.updateGoal(goalId, workspaceId, input);
    },
    onSuccess: async (goal) => {
      await queryClient.invalidateQueries({ queryKey: goalKeys.list(workspaceId) });
      await queryClient.invalidateQueries({ queryKey: goalKeys.detail(goal.id) });
    }
  });
}

export function useDeleteGoal(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalId: string) => GoalService.deleteGoal(goalId),
    onSuccess: async (_data, goalId) => {
      await queryClient.invalidateQueries({ queryKey: goalKeys.list(workspaceId) });
      await queryClient.invalidateQueries({ queryKey: goalKeys.detail(goalId) });
    }
  });
}

export function useAddGoalContribution(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, input }: { goalId: string; input: GoalContributionFormInput }) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return GoalService.addContribution(goalId, workspaceId, input);
    },
    onSuccess: async (contribution) => {
      await queryClient.invalidateQueries({ queryKey: goalKeys.list(workspaceId) });
      await queryClient.invalidateQueries({ queryKey: goalKeys.detail(contribution.goal_id) });
      await queryClient.invalidateQueries({ queryKey: goalKeys.contributions(contribution.goal_id) });
    }
  });
}
