import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { DebtService } from '@features/debt/services/debt.service';
import type { DebtFormInput, DebtPaymentFormInput } from '@features/debt/types/debt.types';

export const debtKeys = {
  list: (workspaceId: string | undefined) => ['debts', workspaceId] as const,
  detail: (debtId: string | undefined, workspaceId: string | undefined) => ['debt', debtId, workspaceId] as const,
  payments: (debtId: string | undefined, workspaceId: string | undefined) =>
    ['debt-payments', debtId, workspaceId] as const,
  wallets: (workspaceId: string | undefined) => ['debt-wallets', workspaceId] as const
};

export function useDebts(workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: debtKeys.list(workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        return [];
      }

      return DebtService.getDebts(workspaceId);
    }
  });
}

export function useDebt(debtId: string | undefined, workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(debtId) && Boolean(workspaceId),
    queryKey: debtKeys.detail(debtId, workspaceId),
    queryFn: () => {
      if (!debtId) {
        throw new Error('Hutang belum dipilih.');
      }

      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return DebtService.getDebt(debtId, workspaceId);
    }
  });
}

export function useDebtPayments(debtId: string | undefined, workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(debtId) && Boolean(workspaceId),
    queryKey: debtKeys.payments(debtId, workspaceId),
    queryFn: () => {
      if (!debtId) {
        return [];
      }

      if (!workspaceId) {
        return [];
      }

      return DebtService.getPayments(debtId, workspaceId);
    }
  });
}

export function useDebtWallets(workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: debtKeys.wallets(workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        return [];
      }

      return DebtService.getWallets(workspaceId);
    }
  });
}

async function invalidateDebtSideEffects(queryClient: ReturnType<typeof useQueryClient>, workspaceId: string | undefined) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: debtKeys.list(workspaceId) }),
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary', workspaceId] }),
    queryClient.invalidateQueries({ queryKey: ['reports', workspaceId] }),
    queryClient.invalidateQueries({ queryKey: ['financial-health', workspaceId] }),
    queryClient.invalidateQueries({ queryKey: ['insights', workspaceId] })
  ]);
}

export function useCreateDebt(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DebtFormInput) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return DebtService.createDebt(workspaceId, input);
    },
    onSuccess: async () => {
      await invalidateDebtSideEffects(queryClient, workspaceId);
    }
  });
}

export function useUpdateDebt(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ debtId, input }: { debtId: string; input: DebtFormInput }) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return DebtService.updateDebt(debtId, workspaceId, input);
    },
    onSuccess: async (debt) => {
      await invalidateDebtSideEffects(queryClient, workspaceId);
      await queryClient.invalidateQueries({ queryKey: debtKeys.detail(debt.id, workspaceId) });
    }
  });
}

export function useDeleteDebt(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (debtId: string) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return DebtService.deleteDebt(debtId, workspaceId);
    },
    onSuccess: async (_data, debtId) => {
      await invalidateDebtSideEffects(queryClient, workspaceId);
      await queryClient.invalidateQueries({ queryKey: debtKeys.detail(debtId, workspaceId) });
    }
  });
}

export function useAddDebtPayment(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ debtId, input }: { debtId: string; input: DebtPaymentFormInput }) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return DebtService.addPayment(debtId, workspaceId, input);
    },
    onSuccess: async (payment) => {
      await invalidateDebtSideEffects(queryClient, workspaceId);
      await queryClient.invalidateQueries({ queryKey: debtKeys.detail(payment.debt_id, workspaceId) });
      await queryClient.invalidateQueries({ queryKey: debtKeys.payments(payment.debt_id, workspaceId) });
    }
  });
}
