import { Plus } from 'lucide-react';
import { Link } from 'react-router';

import type { StatusFilterValue } from '@shared/utils/statusFilters';
import { Button } from '@shared/ui/button';

const emptyTitles: Record<StatusFilterValue, string> = {
  active: 'Belum ada data aktif.',
  all: 'Belum ada data.',
  completed: 'Belum ada data selesai.'
};

type StatusFilterEmptyStateProps = {
  canCreate?: boolean;
  createHref: string;
  ctaLabel: string;
  description?: string;
  filter: StatusFilterValue;
};

export function StatusFilterEmptyState({
  canCreate = true,
  createHref,
  ctaLabel,
  description,
  filter
}: StatusFilterEmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card p-6 text-center text-card-foreground shadow-sm">
      <h2 className="font-semibold">{emptyTitles[filter]}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        {description ?? 'Coba pilih status lain atau tambahkan data baru.'}
      </p>
      {canCreate ? (
        <Button asChild className="mt-5 rounded-full" size="sm">
          <Link to={createHref}>
            <Plus className="size-4" />
            {ctaLabel}
          </Link>
        </Button>
      ) : null}
    </div>
  );
}
