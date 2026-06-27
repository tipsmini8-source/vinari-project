import type { ReactNode } from 'react';

import type { SimulationStatus } from '@features/decision-simulator/types/decision-simulator.types';
import { cn } from '@shared/lib/utils';

const statusClassName: Record<SimulationStatus, string> = {
  Aman: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  Berisiko: 'border-destructive/20 bg-destructive/10 text-destructive',
  'Perlu Perhatian': 'border-amber-500/20 bg-amber-500/10 text-amber-700'
};

export function SimulationResultCard({
  children,
  recommendation,
  status,
  title
}: {
  children: ReactNode;
  recommendation: string;
  status: SimulationStatus;
  title: string;
}) {
  return (
    <section className="rounded-md border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Estimasi dampak simulasi sementara.</p>
        </div>
        <span className={cn('w-fit rounded-full border px-3 py-1 text-sm font-medium', statusClassName[status])}>
          {status}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>

      <div className="mt-5 rounded-md bg-secondary/70 p-4 text-sm leading-6 text-secondary-foreground">
        {recommendation}
      </div>
    </section>
  );
}

export function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}
