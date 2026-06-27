import { Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router';

import type { BudgetStatus, BudgetWithProgress } from '@features/budget/types/budget.types';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';

type BudgetListProps = {
  budgets: BudgetWithProgress[];
  onDelete: (budget: BudgetWithProgress) => void;
};

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  style: 'currency',
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium'
});

const statusLabels: Record<BudgetStatus, string> = {
  safe: 'Aman',
  warning: 'Hampir habis',
  over: 'Over budget'
};

const statusClasses: Record<BudgetStatus, string> = {
  safe: 'bg-primary/10 text-primary',
  warning: 'bg-secondary text-foreground',
  over: 'bg-destructive/10 text-destructive'
};

const progressClasses: Record<BudgetStatus, string> = {
  safe: 'bg-primary',
  warning: 'bg-foreground',
  over: 'bg-destructive'
};

export function BudgetList({ budgets, onDelete }: BudgetListProps) {
  return (
    <div className="grid gap-3">
      {budgets.map((budget) => {
        const progressWidth = `${Math.min(budget.percentage, 100)}%`;

        return (
          <article className="rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm" key={budget.id}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{budget.name}</h2>
                  <span className={cn('rounded-sm px-2 py-0.5 text-xs font-medium', statusClasses[budget.status])}>
                    {statusLabels[budget.status]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {budget.category_name} - {dateFormatter.format(new Date(budget.start_date))} -{' '}
                  {dateFormatter.format(new Date(budget.end_date))}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                <p className="font-semibold">{moneyFormatter.format(budget.amount)}</p>
                <div className="flex gap-1">
                  <Button asChild aria-label="Edit budget" size="icon" variant="ghost">
                    <Link to={`/app/budgets/${budget.id}/edit`}>
                      <Edit className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    aria-label="Hapus budget"
                    onClick={() => onDelete(budget)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn('h-full rounded-full', progressClasses[budget.status])}
                  style={{ width: progressWidth }}
                />
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-muted-foreground">Terpakai</p>
                  <p className="font-medium">{moneyFormatter.format(budget.spent_amount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sisa</p>
                  <p className={cn('font-medium', budget.remaining_amount < 0 ? 'text-destructive' : '')}>
                    {moneyFormatter.format(budget.remaining_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Persentase</p>
                  <p className="font-medium">{budget.percentage}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Alert</p>
                  <p className="font-medium">{budget.alert_percentage}%</p>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
