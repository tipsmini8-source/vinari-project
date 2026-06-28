import { Edit, Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router';

import { GoalProgress } from '@features/goal/components/GoalProgress';
import type { GoalStatus, GoalWithProgress } from '@features/goal/types/goal.types';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';

type GoalListProps = {
  goals: GoalWithProgress[];
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

const statusClasses: Record<GoalStatus, string> = {
  active: 'bg-primary-soft text-primary',
  achieved: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive'
};

const statusLabels: Record<GoalStatus, string> = {
  active: 'Aktif',
  achieved: 'Tercapai',
  cancelled: 'Dibatalkan'
};

export function GoalList({ goals, onDelete }: GoalListProps) {
  return (
    <div className="grid gap-3">
      {goals.map((goal) => (
        <article className="rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm" key={goal.id}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{goal.name}</h2>
                <span className={cn('rounded-sm px-2 py-0.5 text-xs font-medium', statusClasses[goal.status])}>
                  {statusLabels[goal.status]}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {goal.target_date ? dateFormatter.format(new Date(goal.target_date)) : 'Tanpa tanggal target'}
                {goal.wallet_name ? ` - ${goal.wallet_name}` : ''}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
              <p className="font-semibold">{moneyFormatter.format(goal.target_amount)}</p>
              <div className="flex gap-1">
                <Button asChild aria-label="Detail target tabungan" size="icon" variant="ghost">
                  <Link to={`/app/goals/${goal.id}`}>
                    <Eye className="size-4" />
                  </Link>
                </Button>
                <Button asChild aria-label="Edit target tabungan" size="icon" variant="ghost">
                  <Link to={`/app/goals/${goal.id}/edit`}>
                    <Edit className="size-4" />
                  </Link>
                </Button>
                <Button
                  aria-label="Hapus target tabungan"
                  onClick={() => onDelete(goal)}
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
            <GoalProgress percentage={goal.percentage} status={goal.status} />
            <div className="grid gap-3 text-sm sm:grid-cols-4">
              <div>
                <p className="text-muted-foreground">Terkumpul</p>
                <p className="font-medium">{moneyFormatter.format(goal.current_amount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Sisa target</p>
                <p className={cn('font-medium', goal.remaining_amount <= 0 ? 'text-primary' : '')}>
                  {moneyFormatter.format(goal.remaining_amount)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Progres</p>
                <p className="font-medium">{goal.percentage}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium">{statusLabels[goal.status]}</p>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
