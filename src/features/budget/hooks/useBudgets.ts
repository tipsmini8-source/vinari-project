import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { BudgetService } from '@features/budget/services/budget.service';
import type { BudgetFormInput } from '@features/budget/types/budget.types';

export const budgetKeys = {
  list: (workspaceId: string | undefined) => ['budgets', workspaceId] as const,
  detail: (budgetId: string | undefined, workspaceId: string | undefined) => ['budget', budgetId, workspaceId] as const,
  categories: (workspaceId: string | undefined) => ['budget-categories', workspaceId] as const
};

export function useBudgets(workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: budgetKeys.list(workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        return [];
      }

      return BudgetService.getBudgets(workspaceId);
    }
  });
}

export function useBudget(budgetId: string | undefined, workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(budgetId) && Boolean(workspaceId),
    queryKey: budgetKeys.detail(budgetId, workspaceId),
    queryFn: () => {
      if (!budgetId) {
        throw new Error('Budget belum dipilih.');
      }

      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return BudgetService.getBudget(budgetId, workspaceId);
    }
  });
}

export function useBudgetCategories(workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: budgetKeys.categories(workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        return [];
      }

      return BudgetService.getExpenseCategories(workspaceId);
    }
  });
}

async function invalidateBudgetSideEffects(queryClient: ReturnType<typeof useQueryClient>, workspaceId: string | undefined) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: budgetKeys.list(workspaceId) }),
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary', workspaceId] }),
    queryClient.invalidateQueries({ queryKey: ['reports', workspaceId] }),
    queryClient.invalidateQueries({ queryKey: ['financial-health', workspaceId] }),
    queryClient.invalidateQueries({ queryKey: ['insights', workspaceId] })
  ]);
}

export function useCreateBudget(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BudgetFormInput) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return BudgetService.createBudget(workspaceId, input);
    },
    onSuccess: async () => {
      await invalidateBudgetSideEffects(queryClient, workspaceId);
    }
  });
}

export function useUpdateBudget(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ budgetId, input }: { budgetId: string; input: BudgetFormInput }) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return BudgetService.updateBudget(budgetId, workspaceId, input);
    },
    onSuccess: async (budget) => {
      await invalidateBudgetSideEffects(queryClient, workspaceId);
      await queryClient.invalidateQueries({ queryKey: budgetKeys.detail(budget.id, workspaceId) });
    }
  });
}

export function useDeleteBudget(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (budgetId: string) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return BudgetService.deleteBudget(budgetId, workspaceId);
    },
    onSuccess: async (_data, budgetId) => {
      await invalidateBudgetSideEffects(queryClient, workspaceId);
      await queryClient.invalidateQueries({ queryKey: budgetKeys.detail(budgetId, workspaceId) });
    }
  });
}
