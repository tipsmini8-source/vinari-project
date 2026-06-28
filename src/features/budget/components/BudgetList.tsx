import { Edit, Trash2 } from 'lucide-react';

import type { BudgetStatus, BudgetWithProgress } from '@features/budget/types/budget.types';
import { CompactProgressCard } from '@shared/components/CompactProgressCard';
import { getCategoryIcon } from '@shared/utils/icon-map';

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
  warning: 'Peringatan',
  over: 'Melebihi'
};

const statusClasses: Record<BudgetStatus, string> = {
  safe: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-warning',
  over: 'bg-destructive/10 text-destructive'
};

const progressClasses: Record<BudgetStatus, string> = {
  safe: 'bg-success',
  warning: 'bg-warning',
  over: 'bg-destructive'
};

export function BudgetList({ budgets, onDelete }: BudgetListProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {budgets.map((budget) => {
        const CategoryIcon = getCategoryIcon('receipt');
        const remainingLabel =
          budget.remaining_amount < 0
            ? `Melebihi ${moneyFormatter.format(Math.abs(budget.remaining_amount))}`
            : `Sisa ${moneyFormatter.format(budget.remaining_amount)}`;

        return (
          <CompactProgressCard
            badgeClassName={statusClasses[budget.status]}
            badgeLabel={statusLabels[budget.status]}
            footer={[
              {
                label: budget.remaining_amount < 0 ? 'Melebihi batas' : 'Sisa batas',
                tone: budget.remaining_amount < 0 ? 'bad' : 'good',
                value: remainingLabel
              },
              {
                label: 'Periode',
                value: `${dateFormatter.format(new Date(budget.start_date))} - ${dateFormatter.format(
                  new Date(budget.end_date)
                )}`
              }
            ]}
            icon={CategoryIcon}
            iconClassName="bg-success/10 text-success"
            key={budget.id}
            menuActions={[
              { href: `/app/budgets/${budget.id}/edit`, icon: Edit, label: 'Edit' },
              { destructive: true, icon: Trash2, label: 'Hapus', onSelect: () => onDelete(budget) }
            ]}
            primaryText={`${moneyFormatter.format(budget.spent_amount)} dari ${moneyFormatter.format(
              budget.amount
            )} terpakai`}
            progress={budget.percentage}
            progressClassName={progressClasses[budget.status]}
            subtitle={`${budget.category_name} • ${budget.period === 'monthly' ? 'Bulanan' : budget.period}`}
            title={budget.name}
          />
        );
      })}
    </div>
  );
}
