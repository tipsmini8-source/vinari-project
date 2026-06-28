import type { ComponentType, ReactNode } from 'react';
import type { LucideProps } from 'lucide-react';

import type { MoreActionMenuItem } from '@shared/components/MoreActionMenu';
import { MoreActionMenu } from '@shared/components/MoreActionMenu';
import { cn } from '@shared/lib/utils';

type CompactProgressCardProps = {
  action?: ReactNode;
  badgeClassName: string;
  badgeLabel: string;
  footer: Array<{
    label: string;
    tone?: 'default' | 'good' | 'warn' | 'bad';
    value: string;
  }>;
  icon: ComponentType<LucideProps>;
  iconClassName?: string;
  menuActions: MoreActionMenuItem[];
  primaryText: string;
  progress?: number;
  progressClassName?: string;
  subtitle: string;
  title: string;
};

const footerToneClass = {
  bad: 'text-destructive',
  default: 'text-foreground',
  good: 'text-success',
  warn: 'text-warning'
};

export function CompactProgressCard({
  action,
  badgeClassName,
  badgeLabel,
  footer,
  icon: Icon,
  iconClassName,
  menuActions,
  primaryText,
  progress,
  progressClassName,
  subtitle,
  title
}: CompactProgressCardProps) {
  const safeProgress = typeof progress === 'number' ? Math.max(0, Math.min(progress, 100)) : null;

  return (
    <article className="rounded-3xl border border-border/80 bg-card p-4 text-card-foreground shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)] dark:shadow-none">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary',
            iconClassName
          )}
        >
          <Icon className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate font-semibold leading-6">{title}</h2>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
            </div>
            {menuActions.length > 0 ? <MoreActionMenu actions={menuActions} label={`Buka menu ${title}`} /> : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none', badgeClassName)}>
              {badgeLabel}
            </span>
            {safeProgress !== null ? (
              <span className="text-xs font-semibold text-muted-foreground">{Math.round(progress ?? 0)}%</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-sm font-semibold">{primaryText}</p>
        </div>
        {safeProgress !== null ? (
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
            <div className={cn('h-full rounded-full', progressClassName)} style={{ width: `${safeProgress}%` }} />
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {footer.map((item) => (
          <div className="min-w-0 rounded-2xl bg-muted/45 px-3 py-2" key={item.label}>
            <p className="truncate text-[11px] text-muted-foreground">{item.label}</p>
            <p className={cn('mt-0.5 truncate text-sm font-semibold', footerToneClass[item.tone ?? 'default'])}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {action ? <div className="mt-3">{action}</div> : null}
    </article>
  );
}
