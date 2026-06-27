import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { RecurringService } from '@features/recurring/services/recurring.service';
import type {
  RecurringTransactionSubmitInput,
  SubscriptionSubmitInput
} from '@features/recurring/types/recurring.types';

export const recurringKeys = {
  recurringList: (workspaceId: string | undefined) => ['recurring-transactions', workspaceId] as const,
  recurringDetail: (recurringId: string | undefined, workspaceId: string | undefined) =>
    ['recurring-transaction', recurringId, workspaceId] as const,
  subscriptionList: (workspaceId: string | undefined) => ['subscriptions', workspaceId] as const,
  subscriptionDetail: (subscriptionId: string | undefined, workspaceId: string | undefined) =>
    ['subscription', subscriptionId, workspaceId] as const,
  wallets: (workspaceId: string | undefined) => ['recurring-wallets', workspaceId] as const,
  categories: (workspaceId: string | undefined) => ['recurring-categories', workspaceId] as const
};

export function useRecurringTransactions(workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: recurringKeys.recurringList(workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        return [];
      }

      return RecurringService.getRecurringTransactions(workspaceId);
    }
  });
}

export function useRecurringTransaction(recurringId: string | undefined, workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(recurringId) && Boolean(workspaceId),
    queryKey: recurringKeys.recurringDetail(recurringId, workspaceId),
    queryFn: () => {
      if (!recurringId) {
        throw new Error('Transaksi berulang belum dipilih.');
      }

      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return RecurringService.getRecurringTransaction(recurringId, workspaceId);
    }
  });
}

export function useSubscriptions(workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: recurringKeys.subscriptionList(workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        return [];
      }

      return RecurringService.getSubscriptions(workspaceId);
    }
  });
}

export function useSubscription(subscriptionId: string | undefined, workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(subscriptionId) && Boolean(workspaceId),
    queryKey: recurringKeys.subscriptionDetail(subscriptionId, workspaceId),
    queryFn: () => {
      if (!subscriptionId) {
        throw new Error('Subscription belum dipilih.');
      }

      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return RecurringService.getSubscription(subscriptionId, workspaceId);
    }
  });
}

export function useRecurringReferences(workspaceId: string | undefined) {
  const wallets = useQuery({
    enabled: Boolean(workspaceId),
    queryKey: recurringKeys.wallets(workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        return [];
      }

      return RecurringService.getWallets(workspaceId);
    }
  });

  const categories = useQuery({
    enabled: Boolean(workspaceId),
    queryKey: recurringKeys.categories(workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        return [];
      }

      return RecurringService.getCategories(workspaceId);
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

export function useCreateRecurringTransaction(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RecurringTransactionSubmitInput) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return RecurringService.createRecurringTransaction(workspaceId, input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: recurringKeys.recurringList(workspaceId) });
    }
  });
}

export function useUpdateRecurringTransaction(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, recurringId }: { input: RecurringTransactionSubmitInput; recurringId: string }) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return RecurringService.updateRecurringTransaction(recurringId, workspaceId, input);
    },
    onSuccess: async (recurring) => {
      await queryClient.invalidateQueries({ queryKey: recurringKeys.recurringList(workspaceId) });
      await queryClient.invalidateQueries({ queryKey: recurringKeys.recurringDetail(recurring.id, workspaceId) });
    }
  });
}

export function useDeactivateRecurringTransaction(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recurringId: string) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return RecurringService.deactivateRecurringTransaction(recurringId, workspaceId);
    },
    onSuccess: async (_data, recurringId) => {
      await queryClient.invalidateQueries({ queryKey: recurringKeys.recurringList(workspaceId) });
      await queryClient.invalidateQueries({ queryKey: recurringKeys.recurringDetail(recurringId, workspaceId) });
    }
  });
}

export function useDeleteRecurringTransaction(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recurringId: string) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return RecurringService.deleteRecurringTransaction(recurringId, workspaceId);
    },
    onSuccess: async (_data, recurringId) => {
      await queryClient.invalidateQueries({ queryKey: recurringKeys.recurringList(workspaceId) });
      await queryClient.invalidateQueries({ queryKey: recurringKeys.recurringDetail(recurringId, workspaceId) });
    }
  });
}

export function useCreateSubscription(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SubscriptionSubmitInput) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return RecurringService.createSubscription(workspaceId, input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: recurringKeys.subscriptionList(workspaceId) });
    }
  });
}

export function useUpdateSubscription(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, subscriptionId }: { input: SubscriptionSubmitInput; subscriptionId: string }) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return RecurringService.updateSubscription(subscriptionId, workspaceId, input);
    },
    onSuccess: async (subscription) => {
      await queryClient.invalidateQueries({ queryKey: recurringKeys.subscriptionList(workspaceId) });
      await queryClient.invalidateQueries({
        queryKey: recurringKeys.subscriptionDetail(subscription.id, workspaceId)
      });
    }
  });
}

export function useDeactivateSubscription(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionId: string) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return RecurringService.deactivateSubscription(subscriptionId, workspaceId);
    },
    onSuccess: async (_data, subscriptionId) => {
      await queryClient.invalidateQueries({ queryKey: recurringKeys.subscriptionList(workspaceId) });
      await queryClient.invalidateQueries({
        queryKey: recurringKeys.subscriptionDetail(subscriptionId, workspaceId)
      });
    }
  });
}

export function useDeleteSubscription(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionId: string) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return RecurringService.deleteSubscription(subscriptionId, workspaceId);
    },
    onSuccess: async (_data, subscriptionId) => {
      await queryClient.invalidateQueries({ queryKey: recurringKeys.subscriptionList(workspaceId) });
      await queryClient.invalidateQueries({
        queryKey: recurringKeys.subscriptionDetail(subscriptionId, workspaceId)
      });
    }
  });
}
