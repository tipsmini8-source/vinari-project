import { useMutation, useQuery } from '@tanstack/react-query';

import { ReportService } from '@features/report/services/report.service';
import type { ReportFilters } from '@features/report/types/report.types';

export const reportKeys = {
  summary: (workspaceId: string | undefined, filters: ReportFilters) => ['reports', workspaceId, filters] as const
};

export function useReport(workspaceId: string | undefined, filters: ReportFilters) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: reportKeys.summary(workspaceId, filters),
    queryFn: () => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return ReportService.getReport(workspaceId, filters);
    }
  });
}

export function useExportReport(workspaceId: string | undefined) {
  return useMutation({
    mutationFn: (filters: ReportFilters) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return ReportService.exportReportCSV(workspaceId, filters);
    }
  });
}
