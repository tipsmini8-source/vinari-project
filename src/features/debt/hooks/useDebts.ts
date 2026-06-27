import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { DebtService } from '@features/debt/services/debt.service';
import type { DebtFormInput, DebtPaymentFormInput } from '@features/debt/types/debt.types';

export const debtKeys = {
  list: (workspaceId: string | undefined) => ['debts', workspaceId] as const,
  detail: (debtId: string | undefined) => ['debt', debtId] as const,
  payments: (debtId: string | undefined) => ['debt-payments', debtId] as const,
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

export function useDebt(debtId: string | undefined) {
  return useQuery({
    enabled: Boolean(debtId),
    queryKey: debtKeys.detail(debtId),
    queryFn: () => {
      if (!debtId) {
        throw new Error('Hutang belum dipilih.');
      }

      return DebtService.getDebt(debtId);
    }
  });
}

export function useDebtPayments(debtId: string | undefined) {
  return useQuery({
    enabled: Boolean(debtId),
    queryKey: debtKeys.payments(debtId),
    queryFn: () => {
      if (!debtId) {
        return [];
      }

      return DebtService.getPayments(debtId);
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
      await queryClient.invalidateQueries({ queryKey: debtKeys.list(workspaceId) });
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
      await queryClient.invalidateQueries({ queryKey: debtKeys.list(workspaceId) });
      await queryClient.invalidateQueries({ queryKey: debtKeys.detail(debt.id) });
    }
  });
}

export function useDeleteDebt(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (debtId: string) => DebtService.deleteDebt(debtId),
    onSuccess: async (_data, debtId) => {
      await queryClient.invalidateQueries({ queryKey: debtKeys.list(workspaceId) });
      await queryClient.invalidateQueries({ queryKey: debtKeys.detail(debtId) });
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
      await queryClient.invalidateQueries({ queryKey: debtKeys.list(workspaceId) });
      await queryClient.invalidateQueries({ queryKey: debtKeys.detail(payment.debt_id) });
      await queryClient.invalidateQueries({ queryKey: debtKeys.payments(payment.debt_id) });
    }
  });
}
