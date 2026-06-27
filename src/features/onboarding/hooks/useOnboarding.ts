import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { workspaceKeys } from '@/core/workspace';
import { OnboardingService } from '@features/onboarding/services/onboarding.service';
import type { OnboardingInput } from '@features/onboarding/types/onboarding.types';

export function useActiveWorkspace(userId: string | undefined) {
  return useQuery({
    enabled: Boolean(userId),
    queryKey: ['active-workspace', userId],
    queryFn: () => {
      if (!userId) {
        return null;
      }

      return OnboardingService.getActiveWorkspace(userId);
    }
  });
}

export function useCreateOnboarding(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: OnboardingInput) => {
      if (!userId) {
        throw new Error('User belum login.');
      }

      return OnboardingService.createInitialData(userId, input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['active-workspace', userId] });
      await queryClient.invalidateQueries({ queryKey: workspaceKeys.active(userId) });
    }
  });
}
