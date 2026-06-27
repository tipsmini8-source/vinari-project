import type { ReportFilters } from '@features/report/types/report.types';

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getCurrentMonthFilters(): ReportFilters {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    preset: 'current_month',
    dateFrom: formatDate(start),
    dateTo: formatDate(end)
  };
}

export function getPreviousMonthFilters(): ReportFilters {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0);

  return {
    preset: 'previous_month',
    dateFrom: formatDate(start),
    dateTo: formatDate(end)
  };
}
