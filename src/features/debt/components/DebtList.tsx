import { Edit, Eye, Landmark, Trash2 } from 'lucide-react';
import { Link } from 'react-router';

import type { DebtWithProgress } from '@features/debt/types/debt.types';
import { CompactProgressCard } from '@shared/components/CompactProgressCard';
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

function daysUntil(date: string | null) {
  if (!date) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(date);
  dueDate.setHours(0, 0, 0, 0);

  return Math.ceil((dueDate.getTime() - today.getTime()) / 86_400_000);
}

function getDebtCardStatus(debt: DebtWithProgress) {
  const dueInDays = daysUntil(debt.due_date);

  if (debt.status === 'cancelled') {
    return {
      badgeClassName: 'bg-muted text-muted-foreground',
      label: 'Selesai',
      progressClassName: 'bg-muted-foreground'
    };
  }

  if (debt.status === 'paid' || debt.remaining_amount <= 0) {
    return {
      badgeClassName: 'bg-success/10 text-success',
      label: 'Lunas',
      progressClassName: 'bg-success'
    };
  }

  if (dueInDays !== null && dueInDays <= 7) {
    return {
      badgeClassName: 'bg-warning/15 text-warning',
      label: 'Jatuh Tempo',
      progressClassName: 'bg-warning'
    };
  }

  return {
    badgeClassName: 'bg-primary-soft text-primary',
    label: 'Lancar',
    progressClassName: 'bg-primary'
  };
}

function getDueDateLabel(debt: DebtWithProgress) {
  if (debt.remaining_amount <= 0 || debt.status === 'paid') {
    return 'Lunas';
  }

  const dueInDays = daysUntil(debt.due_date);

  if (dueInDays === null) {
    return 'Tanpa jatuh tempo';
  }

  if (dueInDays < 0) {
    return `Lewat ${Math.abs(dueInDays)} hari`;
  }

  if (dueInDays === 0) {
    return 'Jatuh tempo hari ini';
  }

  return `Jatuh tempo ${dueInDays} hari lagi`;
}

export function DebtList({ debts, onDelete }: DebtListProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {debts.map((debt) => {
        const status = getDebtCardStatus(debt);

        return (
          <CompactProgressCard
            action={
              <Button asChild className="w-full rounded-2xl" size="sm" variant="outline">
                <Link to={`/app/debts/${debt.id}`}>
                  <Eye className="size-4" />
                  Lihat Detail
                </Link>
              </Button>
            }
            badgeClassName={status.badgeClassName}
            badgeLabel={status.label}
            footer={[
              {
                label: debt.remaining_amount <= 0 ? 'Status' : 'Sisa hutang',
                tone: debt.remaining_amount <= 0 ? 'good' : 'default',
                value: debt.remaining_amount <= 0 ? 'Lunas' : moneyFormatter.format(debt.remaining_amount)
              },
              {
                label: 'Jatuh tempo',
                tone: status.label === 'Jatuh Tempo' ? 'warn' : 'default',
                value: getDueDateLabel(debt)
              }
            ]}
            icon={Landmark}
            iconClassName="bg-primary-soft text-primary"
            key={debt.id}
            menuActions={[
              { href: `/app/debts/${debt.id}`, icon: Eye, label: 'Detail' },
              { href: `/app/debts/${debt.id}/edit`, icon: Edit, label: 'Edit' },
              { destructive: true, icon: Trash2, label: 'Hapus', onSelect: () => onDelete(debt) }
            ]}
            primaryText={`${moneyFormatter.format(debt.paid_amount)} dari ${moneyFormatter.format(
              debt.principal_amount
            )} sudah dibayar`}
            progress={debt.percentage}
            progressClassName={status.progressClassName}
            subtitle={`${debt.lender_name ?? 'Tanpa kreditur'}${
              debt.due_date ? ` • ${dateFormatter.format(new Date(debt.due_date))}` : ''
            }`}
            title={debt.name}
          />
        );
      })}
    </div>
  );
}
