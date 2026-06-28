import { CreditCard, Edit, PauseCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router';

import {
  formatRecurringDate,
  formatRecurringMoney
} from '@features/recurring/services/recurring-formatters';
import type { RecurringTransaction, ScheduleCycle, Subscription } from '@features/recurring/types/recurring.types';
import { CompactProgressCard } from '@shared/components/CompactProgressCard';
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
  income: 'bg-success/10 text-success',
  expense: 'bg-destructive/10 text-destructive'
};

const typeLabels = {
  income: 'Uang Masuk',
  expense: 'Uang Keluar'
};

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        'rounded-sm px-2 py-0.5 text-xs font-medium',
        isActive ? 'bg-primary-soft text-primary' : 'bg-muted text-muted-foreground'
      )}
    >
      {isActive ? 'Aktif' : 'Nonaktif'}
    </span>
  );
}

function daysUntil(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  return Math.ceil((targetDate.getTime() - today.getTime()) / 86_400_000);
}

function getSubscriptionCardStatus(item: Subscription) {
  const dueInDays = daysUntil(item.next_due_date);

  if (!item.is_active) {
    return {
      badgeClassName: 'bg-muted text-muted-foreground',
      label: 'Selesai'
    };
  }

  if (dueInDays <= 3) {
    return {
      badgeClassName: 'bg-warning/15 text-warning',
      label: 'Jatuh Tempo'
    };
  }

  return {
    badgeClassName: 'bg-primary-soft text-primary',
    label: 'Aktif'
  };
}

function getSubscriptionDueText(item: Subscription) {
  if (!item.is_active) {
    return 'Sudah berakhir';
  }

  const dueInDays = daysUntil(item.next_due_date);

  if (dueInDays < 0) {
    return `Lewat ${Math.abs(dueInDays)} hari`;
  }

  if (dueInDays === 0) {
    return 'Bayar hari ini';
  }

  return `Bayar lagi ${dueInDays} hari lagi`;
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
                <span className={cn('rounded-sm px-2 py-0.5 text-xs font-medium', typeClasses[item.type])}>
                  {typeLabels[item.type]}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.category_name ?? 'Tanpa kategori'} - {item.wallet_name ?? 'Tanpa dompet'}
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
              <p className="text-muted-foreground">Tanggal berikutnya</p>
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
    <div className="grid gap-3 lg:grid-cols-2">
      {items.map((item) => {
        const status = getSubscriptionCardStatus(item);

        return (
          <CompactProgressCard
            badgeClassName={status.badgeClassName}
            badgeLabel={status.label}
            footer={[
              {
                label: 'Tagihan berikutnya',
                tone: status.label === 'Jatuh Tempo' ? 'warn' : 'default',
                value: getSubscriptionDueText(item)
              },
              {
                label: 'Tanggal bayar',
                value: item.is_active ? formatRecurringDate(item.next_due_date) : 'Selesai'
              }
            ]}
            icon={CreditCard}
            iconClassName="bg-primary-soft text-primary"
            key={item.id}
            menuActions={
              canManage
                ? [
                    { href: `/app/subscriptions/${item.id}/edit`, icon: Edit, label: 'Edit' },
                    ...(item.is_active
                      ? [{ icon: PauseCircle, label: 'Nonaktifkan', onSelect: () => onDeactivate(item) }]
                      : []),
                    { destructive: true, icon: Trash2, label: 'Hapus', onSelect: () => onDelete(item) }
                  ]
                : []
            }
            primaryText={`${formatRecurringMoney(item.amount)} • ${cycleLabels[item.billing_cycle]}`}
            subtitle={`${item.category_name ?? 'Tanpa kategori'} • ${cycleLabels[item.billing_cycle]}`}
            title={item.name}
          />
        );
      })}
    </div>
  );
}
