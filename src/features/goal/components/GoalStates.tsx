import { AlertCircle, Target } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@shared/ui/button';

export function GoalSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="rounded-md border border-border bg-card p-4 shadow-sm" key={index}>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="h-4 w-44 animate-pulse rounded bg-secondary" />
                <div className="h-3 w-32 animate-pulse rounded bg-secondary" />
              </div>
              <div className="h-8 w-20 animate-pulse rounded bg-secondary" />
            </div>
            <div className="h-2 w-full animate-pulse rounded bg-secondary" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GoalEmptyState() {
  return (
    <div className="rounded-md border border-dashed border-border bg-card p-8 text-center">
      <Target className="mx-auto size-10 text-muted-foreground" />
      <h2 className="mt-4 font-semibold">Belum ada goal aktif</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        Buat target keuangan dan catat kontribusi tabungan untuk memantau progress.
      </p>
      <Button asChild className="mt-5">
        <Link to="/app/goals/new">Tambah Goal</Link>
      </Button>
    </div>
  );
}

export function GoalErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-md border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-5 text-destructive" />
        <div>
          <h2 className="font-semibold">Goal gagal dimuat</h2>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          <Button className="mt-4" onClick={onRetry} type="button" variant="outline">
            Coba lagi
          </Button>
        </div>
      </div>
    </div>
  );
}
