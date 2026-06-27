import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Workspace } from '@/core/workspace';
import { WalletService } from '@features/wallet/services/wallet.service';
import type { Wallet, WalletFormInput } from '@features/wallet/types/wallet.types';

export const walletKeys = {
  wallets: (workspaceId: string | undefined) => ['wallets', workspaceId] as const,
  detail: (walletId: string | undefined) => ['wallet-detail', walletId] as const
};

export function useWallets(workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: walletKeys.wallets(workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        return [];
      }

      return WalletService.getWallets(workspaceId);
    }
  });
}

export function useWalletDetail(walletId: string | undefined) {
  return useQuery({
    enabled: Boolean(walletId),
    queryKey: walletKeys.detail(walletId),
    queryFn: () => {
      if (!walletId) {
        throw new Error('Wallet belum dipilih.');
      }

      return WalletService.getWalletDetail(walletId);
    }
  });
}

export function useCreateWallet(workspace: Workspace | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: WalletFormInput) => {
      if (!workspace) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return WalletService.createWallet(workspace, input);
    },
    onSuccess: (wallet) => {
      queryClient.setQueryData<Wallet[]>(walletKeys.wallets(workspace?.id), (current = []) => [
        ...current,
        wallet
      ]);
    }
  });
}

export function useUpdateWallet(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, walletId }: { input: WalletFormInput; walletId: string }) =>
      WalletService.updateWallet(walletId, input),
    onMutate: async ({ input, walletId }) => {
      await queryClient.cancelQueries({ queryKey: walletKeys.wallets(workspaceId) });
      const previousWallets = queryClient.getQueryData<Wallet[]>(walletKeys.wallets(workspaceId));

      queryClient.setQueryData<Wallet[]>(walletKeys.wallets(workspaceId), (current = []) =>
        current.map((wallet) =>
          wallet.id === walletId
            ? {
                ...wallet,
                name: input.name,
                wallet_type: input.walletType,
                initial_balance: input.initialBalance,
                icon: input.icon,
                color: input.color
              }
            : wallet
        )
      );

      return { previousWallets };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(walletKeys.wallets(workspaceId), context?.previousWallets);
    },
    onSuccess: (wallet) => {
      queryClient.setQueryData<Wallet[]>(walletKeys.wallets(workspaceId), (current = []) =>
        current.map((item) => (item.id === wallet.id ? wallet : item))
      );
      void queryClient.invalidateQueries({ queryKey: walletKeys.detail(wallet.id) });
    }
  });
}

export function useArchiveWallet(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (walletId: string) => WalletService.archiveWallet(walletId),
    onMutate: async (walletId) => {
      await queryClient.cancelQueries({ queryKey: walletKeys.wallets(workspaceId) });
      const previousWallets = queryClient.getQueryData<Wallet[]>(walletKeys.wallets(workspaceId));

      queryClient.setQueryData<Wallet[]>(walletKeys.wallets(workspaceId), (current = []) =>
        current.map((wallet) => (wallet.id === walletId ? { ...wallet, is_archived: true } : wallet))
      );

      return { previousWallets };
    },
    onError: (_error, _walletId, context) => {
      queryClient.setQueryData(walletKeys.wallets(workspaceId), context?.previousWallets);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: walletKeys.wallets(workspaceId) });
    }
  });
}

export function useDeleteWallet(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (walletId: string) => WalletService.deleteWallet(walletId),
    onMutate: async (walletId) => {
      await queryClient.cancelQueries({ queryKey: walletKeys.wallets(workspaceId) });
      const previousWallets = queryClient.getQueryData<Wallet[]>(walletKeys.wallets(workspaceId));

      queryClient.setQueryData<Wallet[]>(walletKeys.wallets(workspaceId), (current = []) =>
        current.filter((wallet) => wallet.id !== walletId)
      );

      return { previousWallets };
    },
    onError: (_error, _walletId, context) => {
      queryClient.setQueryData(walletKeys.wallets(workspaceId), context?.previousWallets);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: walletKeys.wallets(workspaceId) });
    }
  });
}
