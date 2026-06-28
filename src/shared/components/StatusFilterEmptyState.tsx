import { Plus } from 'lucide-react';
import { Link } from 'react-router';

import { EmptyStateCard } from '@shared/components/EmptyStateCard';
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
    <EmptyStateCard
      action={
        canCreate ? (
        <Button asChild className="rounded-full" size="sm">
          <Link to={createHref}>
            <Plus className="size-4" />
            {ctaLabel}
          </Link>
        </Button>
        ) : null
      }
      description={description ?? 'Coba pilih status lain atau tambahkan data baru.'}
      title={emptyTitles[filter]}
    />
  );
}
