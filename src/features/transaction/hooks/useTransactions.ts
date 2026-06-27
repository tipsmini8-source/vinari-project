import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { TransactionService } from '@features/transaction/services/transaction.service';
import type { TransactionFilterInput, TransactionFormInput } from '@features/transaction/types/transaction.types';

export const transactionKeys = {
  list: (workspaceId: string | undefined, filters: TransactionFilterInput) =>
    ['transactions', workspaceId, filters] as const,
  detail: (transactionId: string | undefined, workspaceId: string | undefined) =>
    ['transaction', transactionId, workspaceId] as const,
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

export function useTransaction(transactionId: string | undefined, workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(transactionId) && Boolean(workspaceId),
    queryKey: transactionKeys.detail(transactionId, workspaceId),
    queryFn: () => {
      if (!transactionId) {
        throw new Error('Transaksi belum dipilih.');
      }

      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return TransactionService.getTransaction(transactionId, workspaceId);
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

async function invalidateTransactionSideEffects(
  queryClient: ReturnType<typeof useQueryClient>,
  workspaceId: string | undefined
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['transactions', workspaceId] }),
    queryClient.invalidateQueries({ queryKey: ['wallets', workspaceId] }),
    queryClient.invalidateQueries({ queryKey: ['wallet-detail'] }),
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary', workspaceId] }),
    queryClient.invalidateQueries({ queryKey: ['reports', workspaceId] }),
    queryClient.invalidateQueries({ queryKey: ['financial-health', workspaceId] }),
    queryClient.invalidateQueries({ queryKey: ['insights', workspaceId] })
  ]);
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
      await invalidateTransactionSideEffects(queryClient, workspaceId);
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
      await invalidateTransactionSideEffects(queryClient, workspaceId);
      await queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transaction.id, workspaceId) });
    }
  });
}

export function useDeleteTransaction(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionId: string) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return TransactionService.deleteTransaction(transactionId, workspaceId);
    },
    onSuccess: async (_data, transactionId) => {
      await invalidateTransactionSideEffects(queryClient, workspaceId);
      await queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transactionId, workspaceId) });
    }
  });
}

export function useExportTransactions(workspaceId: string | undefined) {
  return useMutation({
    mutationFn: (filters: Pick<TransactionFilterInput, 'dateFrom' | 'dateTo'>) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return TransactionService.exportTransactionsCSV(workspaceId, filters);
    }
  });
}
