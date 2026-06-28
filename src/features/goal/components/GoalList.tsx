import { Edit, Eye, Target, Trash2 } from 'lucide-react';
import { Link } from 'react-router';

import type { GoalWithProgress } from '@features/goal/types/goal.types';
import { CompactProgressCard } from '@shared/components/CompactProgressCard';
import { Button } from '@shared/ui/button';

type GoalListProps = {
  goals: GoalWithProgress[];
  onAddContribution?: (goal: GoalWithProgress) => void;
  onDelete: (goal: GoalWithProgress) => void;
};

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  style: 'currency',
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium'
});

function getGoalCardStatus(goal: GoalWithProgress) {
  if (goal.status === 'cancelled') {
    return {
      badgeClassName: 'bg-muted text-muted-foreground',
      label: 'Selesai',
      progressClassName: 'bg-muted-foreground'
    };
  }

  if (goal.status === 'achieved' || goal.percentage >= 100) {
    return {
      badgeClassName: 'bg-success/10 text-success',
      label: 'Tercapai',
      progressClassName: 'bg-success'
    };
  }

  if (goal.percentage >= 80) {
    return {
      badgeClassName: 'bg-warning/15 text-warning',
      label: 'Hampir Tercapai',
      progressClassName: 'bg-warning'
    };
  }

  return {
    badgeClassName: 'bg-primary-soft text-primary',
    label: 'Berjalan',
    progressClassName: 'bg-primary'
  };
}

export function GoalList({ goals, onAddContribution, onDelete }: GoalListProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {goals.map((goal) => {
        const status = getGoalCardStatus(goal);
        const remainingLabel =
          goal.remaining_amount <= 0 ? 'Target tercapai' : `Kurang ${moneyFormatter.format(goal.remaining_amount)}`;
        const canAddContribution = goal.status === 'active' && goal.percentage < 100;

        return (
          <CompactProgressCard
            action={
              canAddContribution && onAddContribution ? (
                <Button className="w-full rounded-2xl" onClick={() => onAddContribution(goal)} size="sm" type="button">
                  Tambah Tabungan
                </Button>
              ) : (
                <Button asChild className="w-full rounded-2xl" size="sm" variant="outline">
                  <Link to={`/app/goals/${goal.id}`}>
                    <Eye className="size-4" />
                    Lihat Detail
                  </Link>
                </Button>
              )
            }
            badgeClassName={status.badgeClassName}
            badgeLabel={status.label}
            footer={[
              {
                label: goal.remaining_amount <= 0 ? 'Status' : 'Sisa target',
                tone: goal.remaining_amount <= 0 ? 'good' : 'default',
                value: remainingLabel
              },
              {
                label: 'Target tanggal',
                value: goal.target_date ? dateFormatter.format(new Date(goal.target_date)) : 'Tanpa deadline'
              }
            ]}
            icon={Target}
            iconClassName="bg-primary-soft text-primary"
            key={goal.id}
            menuActions={[
              { href: `/app/goals/${goal.id}`, icon: Eye, label: 'Detail' },
              { href: `/app/goals/${goal.id}/edit`, icon: Edit, label: 'Edit' },
              { destructive: true, icon: Trash2, label: 'Hapus', onSelect: () => onDelete(goal) }
            ]}
            primaryText={`${moneyFormatter.format(goal.current_amount)} dari ${moneyFormatter.format(
              goal.target_amount
            )} terkumpul`}
            progress={goal.percentage}
            progressClassName={status.progressClassName}
            subtitle={`${moneyFormatter.format(goal.target_amount)} target${goal.wallet_name ? ` • ${goal.wallet_name}` : ''}`}
            title={goal.name}
          />
        );
      })}
    </div>
  );
}
