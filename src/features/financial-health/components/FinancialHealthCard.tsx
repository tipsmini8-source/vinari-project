import { Activity, AlertCircle } from 'lucide-react';
import { Link } from 'react-router';

import type { FinancialHealthScore, FinancialHealthStatus } from '@features/financial-health/types/financial-health.types';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';

const statusClassName: Record<FinancialHealthStatus, string> = {
  Berisiko: 'border-destructive/20 bg-destructive/10 text-destructive',
  'Cukup Sehat': 'border-primary/20 bg-primary/10 text-primary',
  'Perlu Perhatian': 'border-amber-500/20 bg-amber-500/10 text-amber-700',
  Sehat: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700'
};

export function isFinancialHealthDataEmpty(score: FinancialHealthScore) {
  return (
    score.metrics.monthlyIncome === 0 &&
    score.metrics.monthlyExpense === 0 &&
    score.metrics.totalWalletBalance === 0 &&
    score.metrics.activeBudgetCount === 0 &&
    score.metrics.activeGoalCount === 0 &&
    score.metrics.activeDebtTotal === 0
  );
}

export function FinancialHealthSkeleton() {
  return (
    <div className="rounded-md border border-border bg-card p-5 shadow-sm">
      <div className="h-4 w-44 animate-pulse rounded bg-secondary" />
      <div className="mt-4 h-10 w-24 animate-pulse rounded bg-secondary" />
      <div className="mt-4 h-2 w-full animate-pulse rounded bg-secondary" />
      <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-secondary" />
    </div>
  );
}

export function FinancialHealthErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-md border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-5 text-destructive" />
        <div>
          <h2 className="font-semibold">Financial health gagal dimuat</h2>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          <Button className="mt-4" onClick={onRetry} size="sm" type="button" variant="outline">
            Coba lagi
          </Button>
        </div>
      </div>
    </div>
  );
}

export function FinancialHealthEmptyState() {
  return (
    <div className="rounded-md border border-dashed border-border bg-card p-5 text-card-foreground">
      <div className="flex items-start gap-3">
        <Activity className="mt-0.5 size-5 text-muted-foreground" />
        <div>
          <h2 className="font-semibold">Data belum cukup</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tambahkan wallet dan transaksi agar skor kesehatan finansial lebih bermakna.
          </p>
        </div>
      </div>
    </div>
  );
}

export function FinancialHealthCard({
  score,
  showDetailsLink = false
}: {
  score: FinancialHealthScore;
  showDetailsLink?: boolean;
}) {
  return (
    <section className="rounded-md border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-primary" />
            <h2 className="font-semibold">Financial Health Score</h2>
          </div>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-4xl font-semibold">{score.score}</span>
            <span className="pb-1 text-sm text-muted-foreground">/ 100</span>
          </div>
        </div>

        <span className={cn('w-fit rounded-full border px-3 py-1 text-sm font-medium', statusClassName[score.status])}>
          {score.status}
        </span>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.min(Math.max(score.score, 0), 100)}%` }}
        />
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">{score.primaryRecommendation}</p>

      {showDetailsLink ? (
        <Button asChild className="mt-4" size="sm" variant="outline">
          <Link to="/app/reports">Lihat detail</Link>
        </Button>
      ) : null}
    </section>
  );
}
