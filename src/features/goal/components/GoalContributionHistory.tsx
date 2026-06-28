import { CalendarDays } from 'lucide-react';

import type { GoalContribution } from '@features/goal/types/goal.types';

type GoalContributionHistoryProps = {
  contributions: GoalContribution[];
};

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  style: 'currency',
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium'
});

export function GoalContributionHistory({ contributions }: GoalContributionHistoryProps) {
  if (contributions.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border p-6 text-center">
        <CalendarDays className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">Belum ada tabungan masuk untuk target ini.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {contributions.map((contribution) => (
        <article className="rounded-md border border-border p-4" key={contribution.id}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">{moneyFormatter.format(contribution.amount)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {dateFormatter.format(new Date(contribution.contribution_date))}
                {contribution.wallet_name ? ` - ${contribution.wallet_name}` : ''}
              </p>
              {contribution.note ? <p className="mt-2 text-sm text-muted-foreground">{contribution.note}</p> : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
