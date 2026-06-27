import { useQuery } from '@tanstack/react-query';

import { InsightService } from '@features/insight/services/insight.service';

export const insightKeys = {
  list: (workspaceId: string | undefined) => ['insights', workspaceId] as const
};

export function useInsights(workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: insightKeys.list(workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return InsightService.getInsights(workspaceId);
    }
  });
}
