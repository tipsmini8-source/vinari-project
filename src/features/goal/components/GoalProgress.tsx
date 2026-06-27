import type { GoalStatus } from '@features/goal/types/goal.types';
import { cn } from '@shared/lib/utils';

const progressClasses: Record<GoalStatus, string> = {
  active: 'bg-primary',
  achieved: 'bg-primary',
  cancelled: 'bg-muted-foreground'
};

export function GoalProgress({ percentage, status }: { percentage: number; status: GoalStatus }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-secondary">
      <div
        className={cn('h-full rounded-full', progressClasses[status])}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
}
