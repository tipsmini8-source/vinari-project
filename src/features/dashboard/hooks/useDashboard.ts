import { useQuery } from '@tanstack/react-query';

import { DashboardService } from '@features/dashboard/services/dashboard.service';

export const dashboardKeys = {
  summary: (workspaceId: string | undefined) => ['dashboard-summary', workspaceId] as const
};

export function useDashboardSummary(workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: dashboardKeys.summary(workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return DashboardService.getSummary(workspaceId);
    }
  });
}
