import { Edit, Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router';

import { DebtProgress } from '@features/debt/components/DebtProgress';
import type { DebtStatus, DebtWithProgress } from '@features/debt/types/debt.types';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';

type DebtListProps = {
  debts: DebtWithProgress[];
  onDelete: (debt: DebtWithProgress) => void;
};

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  style: 'currency',
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium'
});

const statusClasses: Record<DebtStatus, string> = {
  active: 'bg-primary/10 text-primary',
  paid: 'bg-primary/10 text-primary',
  cancelled: 'bg-destructive/10 text-destructive'
};

export function DebtList({ debts, onDelete }: DebtListProps) {
  return (
    <div className="grid gap-3">
      {debts.map((debt) => (
        <article className="rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm" key={debt.id}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{debt.name}</h2>
                <span className={cn('rounded-sm px-2 py-0.5 text-xs font-medium capitalize', statusClasses[debt.status])}>
                  {debt.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {debt.lender_name ?? 'Tanpa lender'}
                {debt.due_date ? ` - jatuh tempo ${dateFormatter.format(new Date(debt.due_date))}` : ''}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
              <p className="font-semibold">{moneyFormatter.format(debt.remaining_amount)}</p>
              <div className="flex gap-1">
                <Button asChild aria-label="Detail hutang" size="icon" variant="ghost">
                  <Link to={`/app/debts/${debt.id}`}>
                    <Eye className="size-4" />
                  </Link>
                </Button>
                <Button asChild aria-label="Edit hutang" size="icon" variant="ghost">
                  <Link to={`/app/debts/${debt.id}/edit`}>
                    <Edit className="size-4" />
                  </Link>
                </Button>
                <Button
                  aria-label="Hapus hutang"
                  onClick={() => onDelete(debt)}
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
            <DebtProgress percentage={debt.percentage} status={debt.status} />
            <div className="grid gap-3 text-sm sm:grid-cols-4">
              <div>
                <p className="text-muted-foreground">Principal</p>
                <p className="font-medium">{moneyFormatter.format(debt.principal_amount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Terbayar</p>
                <p className="font-medium">{moneyFormatter.format(debt.paid_amount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Sisa</p>
                <p className="font-medium">{moneyFormatter.format(debt.remaining_amount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Progress</p>
                <p className="font-medium">{debt.percentage}%</p>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
