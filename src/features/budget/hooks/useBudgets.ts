import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { BudgetService } from '@features/budget/services/budget.service';
import type { BudgetFormInput } from '@features/budget/types/budget.types';

export const budgetKeys = {
  list: (workspaceId: string | undefined) => ['budgets', workspaceId] as const,
  detail: (budgetId: string | undefined) => ['budget', budgetId] as const,
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

export function useBudget(budgetId: string | undefined) {
  return useQuery({
    enabled: Boolean(budgetId),
    queryKey: budgetKeys.detail(budgetId),
    queryFn: () => {
      if (!budgetId) {
        throw new Error('Budget belum dipilih.');
      }

      return BudgetService.getBudget(budgetId);
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
      await queryClient.invalidateQueries({ queryKey: budgetKeys.list(workspaceId) });
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
      await queryClient.invalidateQueries({ queryKey: budgetKeys.list(workspaceId) });
      await queryClient.invalidateQueries({ queryKey: budgetKeys.detail(budget.id) });
    }
  });
}

export function useDeleteBudget(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (budgetId: string) => BudgetService.deleteBudget(budgetId),
    onSuccess: async (_data, budgetId) => {
      await queryClient.invalidateQueries({ queryKey: budgetKeys.list(workspaceId) });
      await queryClient.invalidateQueries({ queryKey: budgetKeys.detail(budgetId) });
    }
  });
}
