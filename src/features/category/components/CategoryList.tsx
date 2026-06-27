import { Archive, Edit } from 'lucide-react';
import { Link } from 'react-router';

import type { Category } from '@features/category/types/category.types';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';

type CategoryListProps = {
  canManage: boolean;
  categories: Category[];
  onArchive: (category: Category) => void;
};

const typeLabels = {
  income: 'Income',
  expense: 'Expense'
};

const typeClasses = {
  income: 'bg-primary/10 text-primary',
  expense: 'bg-secondary text-foreground'
};

export function CategoryList({ canManage, categories, onArchive }: CategoryListProps) {
  return (
    <div className="grid gap-3">
      {categories.map((category) => (
        <article className="rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm" key={category.id}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-background text-sm font-semibold"
                style={{ color: category.color ?? undefined }}
              >
                {category.icon || category.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="break-words font-semibold">{category.name}</h2>
                  <span className="rounded-sm bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {category.is_default ? 'Default' : 'Custom'}
                  </span>
                  <span className={cn('rounded-sm px-2 py-0.5 text-xs font-medium', typeClasses[category.type])}>
                    {typeLabels[category.type]}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>Sort order {category.sort_order}</span>
                  {category.color ? (
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="size-3 rounded-full border border-border"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.color}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {canManage ? (
              <div className="flex justify-end gap-1">
                <Button asChild aria-label="Edit kategori" size="icon" variant="ghost">
                  <Link to={`/app/categories/${category.id}/edit`}>
                    <Edit className="size-4" />
                  </Link>
                </Button>
                <Button
                  aria-label="Arsipkan kategori"
                  onClick={() => onArchive(category)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Archive className="size-4" />
                </Button>
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
