import { useQuery } from '@tanstack/react-query';

import { FinancialHealthService } from '@features/financial-health/services/financial-health.service';

export const financialHealthKeys = {
  score: (workspaceId: string | undefined) => ['financial-health', workspaceId] as const
};

export function useFinancialHealthScore(workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: financialHealthKeys.score(workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return FinancialHealthService.getScore(workspaceId);
    }
  });
}
