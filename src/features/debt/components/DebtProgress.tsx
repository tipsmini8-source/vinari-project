import type { DebtStatus } from '@features/debt/types/debt.types';
import { cn } from '@shared/lib/utils';

const progressClasses: Record<DebtStatus, string> = {
  active: 'bg-primary',
  paid: 'bg-primary',
  cancelled: 'bg-muted-foreground'
};

export function DebtProgress({ percentage, status }: { percentage: number; status: DebtStatus }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-secondary">
      <div
        className={cn('h-full rounded-full', progressClasses[status])}
        style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
      />
    </div>
  );
}
