import { CreditCard, Edit, PauseCircle, Repeat, Trash2 } from 'lucide-react';

import {
  formatRecurringDate,
  formatRecurringMoney
} from '@features/recurring/services/recurring-formatters';
import type { RecurringTransaction, ScheduleCycle, Subscription } from '@features/recurring/types/recurring.types';
import { CompactProgressCard } from '@shared/components/CompactProgressCard';
import { Button } from '@shared/ui/button';

type RecurringTransactionListProps = {
  canManage: boolean;
  items: RecurringTransaction[];
  onDeactivate: (item: RecurringTransaction) => void;
  onDelete: (item: RecurringTransaction) => void;
  onRun?: (item: RecurringTransaction) => void;
};

type SubscriptionListProps = {
  canManage: boolean;
  items: Subscription[];
  onDeactivate: (item: Subscription) => void;
  onDelete: (item: Subscription) => void;
  onPay?: (item: Subscription) => void;
};

const cycleLabels: Record<ScheduleCycle, string> = {
  daily: 'Harian',
  weekly: 'Mingguan',
  monthly: 'Bulanan',
  yearly: 'Tahunan'
};

const typeLabels = {
  income: 'Uang Masuk',
  expense: 'Uang Keluar'
};

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
  onDelete,
  onRun
}: RecurringTransactionListProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {items.map((item) => (
        <CompactProgressCard
          action={
            item.is_active && onRun ? (
              <Button className="w-full rounded-2xl" onClick={() => onRun(item)} size="sm" type="button">
                Catat Sekarang
              </Button>
            ) : null
          }
          badgeClassName={item.is_active ? 'bg-primary-soft text-primary' : 'bg-muted text-muted-foreground'}
          badgeLabel={item.is_active ? 'Aktif' : 'Selesai'}
          footer={[
            { label: 'Frekuensi', value: cycleLabels[item.frequency] },
            { label: 'Jadwal berikutnya', value: item.is_active ? formatRecurringDate(item.next_run_date) : 'Selesai' }
          ]}
          icon={Repeat}
          iconClassName={item.type === 'income' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}
          key={item.id}
          menuActions={
            canManage
              ? [
                  { href: `/app/recurring/${item.id}/edit`, icon: Edit, label: 'Edit' },
                  ...(item.is_active
                    ? [{ icon: PauseCircle, label: 'Nonaktifkan', onSelect: () => onDeactivate(item) }]
                    : []),
                  { destructive: true, icon: Trash2, label: 'Hapus', onSelect: () => onDelete(item) }
                ]
              : []
          }
          primaryText={`${formatRecurringMoney(item.amount)} • ${cycleLabels[item.frequency]}`}
          subtitle={`${item.category_name ?? 'Tanpa kategori'} • ${typeLabels[item.type]}`}
          title={item.title}
        />
      ))}
    </div>
  );
}

export function SubscriptionList({ canManage, items, onDeactivate, onDelete, onPay }: SubscriptionListProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {items.map((item) => {
        const status = getSubscriptionCardStatus(item);

        return (
          <CompactProgressCard
            action={
              item.is_active && onPay ? (
                <Button className="w-full rounded-2xl" onClick={() => onPay(item)} size="sm" type="button">
                  Bayar
                </Button>
              ) : null
            }
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
