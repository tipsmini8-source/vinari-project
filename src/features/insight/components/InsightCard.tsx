import { AlertTriangle, CheckCircle2, Info, Siren } from 'lucide-react';
import { Link } from 'react-router';

import type { FinancialInsight, InsightPriority, InsightType } from '@features/insight/types/insight.types';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';

const typeClassName: Record<InsightType, string> = {
  danger: 'border-destructive/20 bg-destructive/10 text-destructive',
  info: 'border-primary/20 bg-primary-soft text-primary',
  positive: 'border-success/20 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/15 text-warning'
};

const priorityClassName: Record<InsightPriority, string> = {
  high: 'border-destructive/20 bg-destructive/10 text-destructive',
  low: 'border-border bg-secondary text-secondary-foreground',
  medium: 'border-warning/30 bg-warning/15 text-warning'
};

const iconByType = {
  danger: Siren,
  info: Info,
  positive: CheckCircle2,
  warning: AlertTriangle
};

export function InsightCard({ insight }: { insight: FinancialInsight }) {
  const Icon = iconByType[insight.type];

  return (
    <article className="rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-start gap-3">
        <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-md', typeClassName[insight.type])}>
          <Icon className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{insight.title}</h3>
            <span className={cn('rounded-full border px-2 py-0.5 text-xs font-medium capitalize', typeClassName[insight.type])}>
              {insight.type}
            </span>
            <span className={cn('rounded-full border px-2 py-0.5 text-xs font-medium capitalize', priorityClassName[insight.priority])}>
              {insight.priority}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{insight.message}</p>

          {insight.action_url && insight.action_label ? (
            <Button asChild className="mt-4" size="sm" variant="outline">
              <Link to={insight.action_url}>{insight.action_label}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
