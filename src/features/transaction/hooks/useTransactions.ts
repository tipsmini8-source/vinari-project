import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { TransactionService } from '@features/transaction/services/transaction.service';
import type { TransactionFilterInput, TransactionFormInput } from '@features/transaction/types/transaction.types';

export const transactionKeys = {
  list: (workspaceId: string | undefined, filters: TransactionFilterInput) =>
    ['transactions', workspaceId, filters] as const,
  detail: (transactionId: string | undefined) => ['transaction', transactionId] as const,
  wallets: (workspaceId: string | undefined) => ['transaction-wallets', workspaceId] as const,
  categories: (workspaceId: string | undefined) => ['transaction-categories', workspaceId] as const
};

export function useTransactions(workspaceId: string | undefined, filters: TransactionFilterInput) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: transactionKeys.list(workspaceId, filters),
    queryFn: () => {
      if (!workspaceId) {
        return [];
      }

      return TransactionService.getTransactions(workspaceId, filters);
    }
  });
}

export function useTransaction(transactionId: string | undefined) {
  return useQuery({
    enabled: Boolean(transactionId),
    queryKey: transactionKeys.detail(transactionId),
    queryFn: () => {
      if (!transactionId) {
        throw new Error('Transaksi belum dipilih.');
      }

      return TransactionService.getTransaction(transactionId);
    }
  });
}

export function useTransactionReferences(workspaceId: string | undefined) {
  const wallets = useQuery({
    enabled: Boolean(workspaceId),
    queryKey: transactionKeys.wallets(workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        return [];
      }

      return TransactionService.getWallets(workspaceId);
    }
  });

  const categories = useQuery({
    enabled: Boolean(workspaceId),
    queryKey: transactionKeys.categories(workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        return [];
      }

      return TransactionService.getCategories(workspaceId);
    }
  });

  return {
    wallets,
    categories,
    isLoading: wallets.isLoading || categories.isLoading,
    isError: wallets.isError || categories.isError,
    error: wallets.error ?? categories.error
  };
}

export function useCreateTransaction(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TransactionFormInput) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return TransactionService.createTransaction(workspaceId, input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transactions', workspaceId] });
    }
  });
}

export function useUpdateTransaction(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, transactionId }: { input: TransactionFormInput; transactionId: string }) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return TransactionService.updateTransaction(transactionId, workspaceId, input);
    },
    onSuccess: async (transaction) => {
      await queryClient.invalidateQueries({ queryKey: ['transactions', workspaceId] });
      await queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transaction.id) });
    }
  });
}

export function useDeleteTransaction(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: string) => TransactionService.deleteTransaction(transactionId),
    onSuccess: async (_data, transactionId) => {
      await queryClient.invalidateQueries({ queryKey: ['transactions', workspaceId] });
      await queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transactionId) });
    }
  });
}
