import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { AdminService } from '@features/admin/services/admin.service';
import type { AdminPaymentStatus } from '@features/admin/types/admin.types';

export const adminKeys = {
  proofPreview: (proofUrl: string | null | undefined) => ['admin-payment-proof-preview', proofUrl] as const,
  status: ['admin-status'] as const,
  paymentRequests: (status: AdminPaymentStatus) => ['admin-payment-requests', status] as const,
  stats: ['admin-payment-stats'] as const
};

async function invalidateAdminPayments(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['admin-payment-requests'] }),
    queryClient.invalidateQueries({ queryKey: adminKeys.stats })
  ]);
}

export function useAdminStatus(enabled = true) {
  return useQuery({
    enabled,
    queryKey: adminKeys.status,
    queryFn: () => AdminService.isAdmin()
  });
}

export function useAdminPaymentStats() {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: () => AdminService.getPaymentStats()
  });
}

export function useAdminPaymentRequests(status: AdminPaymentStatus) {
  return useQuery({
    queryKey: adminKeys.paymentRequests(status),
    queryFn: () => AdminService.getPaymentRequests(status)
  });
}

export function useApprovePaymentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentRequestId: string) => AdminService.approvePaymentRequest(paymentRequestId),
    onSuccess: async () => {
      await invalidateAdminPayments(queryClient);
    }
  });
}

export function useRejectPaymentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentRequestId, reason }: { paymentRequestId: string; reason: string }) =>
      AdminService.rejectPaymentRequest(paymentRequestId, reason),
    onSuccess: async () => {
      await invalidateAdminPayments(queryClient);
    }
  });
}

export function useAdminPaymentProofPreview(proofUrl: string | null | undefined) {
  return useQuery({
    enabled: Boolean(proofUrl),
    queryKey: adminKeys.proofPreview(proofUrl),
    queryFn: () => {
      if (!proofUrl) {
        throw new Error('Bukti pembayaran belum tersedia.');
      }

      return AdminService.getPaymentProofPreview(proofUrl);
    }
  });
}
