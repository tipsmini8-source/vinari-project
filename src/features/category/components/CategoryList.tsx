import { Archive, Edit } from 'lucide-react';
import { createElement } from 'react';
import { Link } from 'react-router';

import type { Category } from '@features/category/types/category.types';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';
import { getCategoryIcon } from '@shared/utils/icon-map';

type CategoryListProps = {
  canManage: boolean;
  categories: Category[];
  onArchive: (category: Category) => void;
};

const typeLabels = {
  income: 'Uang Masuk',
  expense: 'Uang Keluar'
};

const typeClasses = {
  income: 'bg-success/10 text-success',
  expense: 'bg-destructive/10 text-destructive'
};

function getSoftColor(color: string | null) {
  return /^#[0-9a-fA-F]{6}$/.test(color ?? '') ? `${color}18` : '#e0f2fe';
}

function getIconColor(color: string | null) {
  return /^#[0-9a-fA-F]{6}$/.test(color ?? '') ? String(color) : '#0077b6';
}

export function CategoryList({ canManage, categories, onArchive }: CategoryListProps) {
  return (
    <div className="grid gap-3">
      {categories.map((category) => {
        return (
          <article className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm" key={category.id}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: getSoftColor(category.color),
                    color: getIconColor(category.color)
                  }}
                >
                  {createElement(getCategoryIcon(category.icon), { className: 'size-5' })}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words text-base font-semibold">{category.name}</h2>
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', typeClasses[category.type])}>
                      {typeLabels[category.type]}
                    </span>
                    {category.is_default ? (
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        Bawaan
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {category.is_default ? 'Kategori bawaan Vinari' : 'Kategori buatan sendiri'}
                  </p>
                </div>
              </div>

              {canManage ? (
                <div className="flex shrink-0 justify-end gap-1">
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
        );
      })}
    </div>
  );
}
