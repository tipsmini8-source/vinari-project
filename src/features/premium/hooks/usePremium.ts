import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useWorkspace } from '@/core/workspace';
import { PremiumService } from '@features/premium/services/premium.service';
import type { PaymentMethod, PaymentRequest, Plan } from '@features/premium/types/premium.types';

export const premiumKeys = {
  billing: (workspaceId: string | undefined) => ['premium-billing', workspaceId] as const,
  paymentMethods: ['premium-payment-methods'] as const,
  proofPreview: (proofUrl: string | null | undefined) => ['payment-proof-preview', proofUrl] as const,
  plans: ['premium-plans'] as const
};

export function hasFeature(plan: Plan | null | undefined, featureKey: string) {
  return Boolean(plan?.features?.[featureKey]);
}

export function isPremium(plan: Plan | null | undefined) {
  return Boolean(plan && plan.code !== 'free');
}

export function usePlans() {
  return useQuery({
    queryKey: premiumKeys.plans,
    queryFn: () => PremiumService.getPlans()
  });
}

export function useBillingData(workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: premiumKeys.billing(workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return PremiumService.getBillingData(workspaceId);
    }
  });
}

export function useActivePaymentMethods() {
  return useQuery({
    queryKey: premiumKeys.paymentMethods,
    queryFn: () => PremiumService.getActivePaymentMethods()
  });
}

export function usePlan() {
  const { workspace } = useWorkspace();
  const billingQuery = useBillingData(workspace?.id);
  const activePlan = billingQuery.data?.activePlan ?? null;

  return {
    ...billingQuery,
    activePlan,
    hasFeature: (featureKey: string) => hasFeature(activePlan, featureKey),
    isPremium: isPremium(activePlan),
    subscription: billingQuery.data?.subscription ?? null
  };
}

export function useCreatePaymentRequest(workspaceId: string | undefined, userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentMethod, plan }: { paymentMethod: PaymentMethod; plan: Plan }) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      if (!userId) {
        throw new Error('User aktif tidak ditemukan.');
      }

      return PremiumService.createPaymentRequest(workspaceId, userId, plan, paymentMethod);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: premiumKeys.billing(workspaceId) });
    }
  });
}

export function useUploadPaymentProof(workspaceId: string | undefined, userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, paymentRequest }: { file: File; paymentRequest: PaymentRequest }) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      if (!userId) {
        throw new Error('User aktif tidak ditemukan.');
      }

      return PremiumService.uploadPaymentProof(paymentRequest, userId, file);
    },
    onSuccess: async (_proofPath, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: premiumKeys.billing(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: premiumKeys.proofPreview(variables.paymentRequest.proof_url) })
      ]);
    }
  });
}

export function usePaymentProofPreview(proofUrl: string | null | undefined) {
  return useQuery({
    enabled: Boolean(proofUrl),
    queryKey: premiumKeys.proofPreview(proofUrl),
    queryFn: () => {
      if (!proofUrl) {
        throw new Error('Bukti pembayaran belum tersedia.');
      }

      return PremiumService.getPaymentProofPreview(proofUrl);
    }
  });
}
