import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useWorkspace } from '@/core/workspace';
import { PremiumService } from '@features/premium/services/premium.service';
import type { Plan } from '@features/premium/types/premium.types';

export const premiumKeys = {
  billing: (workspaceId: string | undefined) => ['premium-billing', workspaceId] as const,
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
    mutationFn: (plan: Plan) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      if (!userId) {
        throw new Error('User aktif tidak ditemukan.');
      }

      return PremiumService.createPaymentRequest(workspaceId, userId, plan);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: premiumKeys.billing(workspaceId) });
    }
  });
}
