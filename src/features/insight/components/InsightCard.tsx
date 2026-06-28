import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

import type { FriendlyInsight } from '@features/insight/services/insight-view.mapper';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';

const badgeClassName: Record<FriendlyInsight['statusTone'], string> = {
  check: 'bg-warning/15 text-warning ring-warning/20',
  good: 'bg-success/10 text-success ring-success/20',
  important: 'bg-destructive/10 text-destructive ring-destructive/20',
  suggestion: 'bg-primary/10 text-primary ring-primary/20'
};

const iconClassName: Record<FriendlyInsight['statusTone'], string> = {
  check: 'bg-warning/15 text-warning',
  good: 'bg-success/10 text-success',
  important: 'bg-destructive/10 text-destructive',
  suggestion: 'bg-primary/10 text-primary'
};

export function StatusBadge({ insight }: { insight: FriendlyInsight }) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1', badgeClassName[insight.statusTone])}>
      {insight.statusLabel}
    </span>
  );
}

export function InsightCard({ compact = false, insight }: { compact?: boolean; insight: FriendlyInsight }) {
  const Icon = insight.icon;

  return (
    <article
      className={cn(
        'group rounded-3xl border border-border bg-card text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
        compact ? 'p-4' : 'p-5'
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex shrink-0 items-center justify-center rounded-2xl',
            compact ? 'size-10' : 'size-12',
            iconClassName[insight.statusTone]
          )}
        >
          <Icon className={compact ? 'size-5' : 'size-6'} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className={cn('font-semibold leading-snug', compact ? 'text-sm' : 'text-base')}>{insight.title}</h3>
            {insight.actionUrl ? <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition group-hover:text-primary" /> : null}
          </div>
          <div className="mt-2">
            <StatusBadge insight={insight} />
          </div>
          <p className={cn('mt-3 leading-6 text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>
            {insight.message}
          </p>

          {insight.actionUrl && insight.actionLabel ? (
            <Button asChild className="mt-4 rounded-full" size={compact ? 'sm' : 'default'} variant={compact ? 'outline' : 'secondary'}>
              <Link to={insight.actionUrl}>{insight.actionLabel}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
