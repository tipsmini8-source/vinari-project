import { Edit, PauseCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router';

import {
  formatRecurringDate,
  formatRecurringMoney
} from '@features/recurring/services/recurring-formatters';
import type { RecurringTransaction, ScheduleCycle, Subscription } from '@features/recurring/types/recurring.types';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';

type RecurringTransactionListProps = {
  canManage: boolean;
  items: RecurringTransaction[];
  onDeactivate: (item: RecurringTransaction) => void;
  onDelete: (item: RecurringTransaction) => void;
};

type SubscriptionListProps = {
  canManage: boolean;
  items: Subscription[];
  onDeactivate: (item: Subscription) => void;
  onDelete: (item: Subscription) => void;
};

const cycleLabels: Record<ScheduleCycle, string> = {
  daily: 'Harian',
  weekly: 'Mingguan',
  monthly: 'Bulanan',
  yearly: 'Tahunan'
};

const typeClasses = {
  income: 'bg-primary/10 text-primary',
  expense: 'bg-destructive/10 text-destructive'
};

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        'rounded-sm px-2 py-0.5 text-xs font-medium',
        isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
      )}
    >
      {isActive ? 'Aktif' : 'Nonaktif'}
    </span>
  );
}

export function RecurringTransactionList({
  canManage,
  items,
  onDeactivate,
  onDelete
}: RecurringTransactionListProps) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <article className="rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm" key={item.id}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{item.title}</h2>
                <StatusBadge isActive={item.is_active} />
                <span className={cn('rounded-sm px-2 py-0.5 text-xs font-medium capitalize', typeClasses[item.type])}>
                  {item.type}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.category_name ?? 'Tanpa kategori'} - {item.wallet_name ?? 'Tanpa wallet'}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
              <p className="font-semibold">{formatRecurringMoney(item.amount)}</p>
              {canManage ? (
                <div className="flex gap-1">
                  <Button asChild aria-label="Edit transaksi berulang" size="icon" variant="ghost">
                    <Link to={`/app/recurring/${item.id}/edit`}>
                      <Edit className="size-4" />
                    </Link>
                  </Button>
                  {item.is_active ? (
                    <Button
                      aria-label="Nonaktifkan transaksi berulang"
                      onClick={() => onDeactivate(item)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <PauseCircle className="size-4" />
                    </Button>
                  ) : null}
                  <Button
                    aria-label="Hapus transaksi berulang"
                    onClick={() => onDelete(item)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Frekuensi</p>
              <p className="font-medium">{cycleLabels[item.frequency]}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Next run</p>
              <p className="font-medium">{formatRecurringDate(item.next_run_date)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Mulai</p>
              <p className="font-medium">{formatRecurringDate(item.start_date)}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function SubscriptionList({ canManage, items, onDeactivate, onDelete }: SubscriptionListProps) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <article className="rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm" key={item.id}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{item.name}</h2>
                <StatusBadge isActive={item.is_active} />
                <span className="rounded-sm bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">
                  {cycleLabels[item.billing_cycle]}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.category_name ?? 'Tanpa kategori'} - {item.wallet_name ?? 'Tanpa wallet'}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
              <p className="font-semibold">{formatRecurringMoney(item.amount)}</p>
              {canManage ? (
                <div className="flex gap-1">
                  <Button asChild aria-label="Edit subscription" size="icon" variant="ghost">
                    <Link to={`/app/subscriptions/${item.id}/edit`}>
                      <Edit className="size-4" />
                    </Link>
                  </Button>
                  {item.is_active ? (
                    <Button
                      aria-label="Nonaktifkan subscription"
                      onClick={() => onDeactivate(item)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <PauseCircle className="size-4" />
                    </Button>
                  ) : null}
                  <Button
                    aria-label="Hapus subscription"
                    onClick={() => onDelete(item)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Billing cycle</p>
              <p className="font-medium">{cycleLabels[item.billing_cycle]}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Next due</p>
              <p className="font-medium">{formatRecurringDate(item.next_due_date)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Nominal</p>
              <p className="font-medium">{formatRecurringMoney(item.amount)}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
