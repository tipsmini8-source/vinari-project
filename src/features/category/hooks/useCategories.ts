import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { CategoryService } from '@features/category/services/category.service';
import type { CategorySubmitInput, CategoryType } from '@features/category/types/category.types';

export const categoryKeys = {
  list: (workspaceId: string | undefined, type: CategoryType) => ['categories', workspaceId, type] as const,
  detail: (categoryId: string | undefined, workspaceId: string | undefined) =>
    ['category', categoryId, workspaceId] as const
};

async function invalidateCategoryConsumers(
  queryClient: ReturnType<typeof useQueryClient>,
  workspaceId: string | undefined
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['categories', workspaceId] }),
    queryClient.invalidateQueries({ queryKey: ['transaction-categories', workspaceId] }),
    queryClient.invalidateQueries({ queryKey: ['budget-categories', workspaceId] })
  ]);
}

export function useCategories(workspaceId: string | undefined, type: CategoryType) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: categoryKeys.list(workspaceId, type),
    queryFn: () => {
      if (!workspaceId) {
        return [];
      }

      return CategoryService.getCategories(workspaceId, type);
    }
  });
}

export function useCategory(categoryId: string | undefined, workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(categoryId) && Boolean(workspaceId),
    queryKey: categoryKeys.detail(categoryId, workspaceId),
    queryFn: () => {
      if (!categoryId) {
        throw new Error('Kategori belum dipilih.');
      }

      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return CategoryService.getCategory(categoryId, workspaceId);
    }
  });
}

export function useCreateCategory(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CategorySubmitInput) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return CategoryService.createCategory(workspaceId, input);
    },
    onSuccess: async () => {
      await invalidateCategoryConsumers(queryClient, workspaceId);
    }
  });
}

export function useUpdateCategory(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, input }: { categoryId: string; input: CategorySubmitInput }) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return CategoryService.updateCategory(categoryId, workspaceId, input);
    },
    onSuccess: async (category) => {
      await invalidateCategoryConsumers(queryClient, workspaceId);
      await queryClient.invalidateQueries({ queryKey: categoryKeys.detail(category.id, workspaceId) });
    }
  });
}

export function useArchiveCategory(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return CategoryService.archiveCategory(categoryId, workspaceId);
    },
    onSuccess: async (_data, categoryId) => {
      await invalidateCategoryConsumers(queryClient, workspaceId);
      await queryClient.invalidateQueries({ queryKey: categoryKeys.detail(categoryId, workspaceId) });
    }
  });
}
