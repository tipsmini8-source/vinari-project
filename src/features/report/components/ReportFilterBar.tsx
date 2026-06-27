import type { ReportFilterPreset, ReportFilters } from '@features/report/types/report.types';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { getCurrentMonthFilters, getPreviousMonthFilters } from './report-filter-utils';

type ReportFilterBarProps = {
  filters: ReportFilters;
  onChange: (filters: ReportFilters) => void;
};

function resolvePreset(preset: ReportFilterPreset, currentFilters: ReportFilters): ReportFilters {
  if (preset === 'current_month') {
    return getCurrentMonthFilters();
  }

  if (preset === 'previous_month') {
    return getPreviousMonthFilters();
  }

  return {
    ...currentFilters,
    preset: 'custom'
  };
}

export function ReportFilterBar({ filters, onChange }: ReportFilterBarProps) {
  return (
    <div className="rounded-md border border-border bg-card p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="preset">Periode</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="preset"
            onChange={(event) => onChange(resolvePreset(event.target.value as ReportFilterPreset, filters))}
            value={filters.preset}
          >
            <option value="current_month">Bulan ini</option>
            <option value="previous_month">Bulan sebelumnya</option>
            <option value="custom">Custom date range</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateFrom">Dari</Label>
          <Input
            id="dateFrom"
            onChange={(event) => onChange({ ...filters, dateFrom: event.target.value, preset: 'custom' })}
            type="date"
            value={filters.dateFrom}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateTo">Sampai</Label>
          <Input
            id="dateTo"
            onChange={(event) => onChange({ ...filters, dateTo: event.target.value, preset: 'custom' })}
            type="date"
            value={filters.dateTo}
          />
        </div>
      </div>
    </div>
  );
}
