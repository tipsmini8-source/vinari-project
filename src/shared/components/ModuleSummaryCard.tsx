import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

import { cn } from '@shared/lib/utils';

export type ModuleSummaryStat = {
  icon: ComponentType<LucideProps>;
  label: string;
  tone?: 'default' | 'good' | 'warn' | 'bad';
  value: string;
};

type ModuleSummaryCardProps = {
  stats: ModuleSummaryStat[];
};

const toneClasses: Record<NonNullable<ModuleSummaryStat['tone']>, string> = {
  bad: 'bg-destructive/10 text-destructive',
  default: 'bg-primary-soft text-primary',
  good: 'bg-success/10 text-success',
  warn: 'bg-warning/15 text-warning'
};

export function ModuleSummaryCard({ stats }: ModuleSummaryCardProps) {
  return (
    <section className="rounded-3xl border border-border/80 bg-card p-4 text-card-foreground shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:shadow-none">
      <div className="grid grid-cols-3 gap-2">
        {stats.map(({ icon: Icon, label, tone = 'default', value }) => (
          <div className="min-w-0 rounded-2xl bg-muted/45 p-3" key={label}>
            <span className={cn('mb-2 flex size-8 items-center justify-center rounded-xl', toneClasses[tone])}>
              <Icon className="size-4" />
            </span>
            <p className="truncate text-[11px] font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 truncate text-sm font-bold tracking-normal sm:text-base">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
