import { AlertCircle, Lightbulb } from 'lucide-react';

import { Button } from '@shared/ui/button';

export function InsightSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <div className="rounded-md border border-border bg-card p-4 shadow-sm" key={index}>
          <div className="flex gap-3">
            <div className="size-10 animate-pulse rounded-md bg-secondary" />
            <div className="flex-1">
              <div className="h-4 w-44 animate-pulse rounded bg-secondary" />
              <div className="mt-3 h-3 w-full animate-pulse rounded bg-secondary" />
              <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-secondary" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function InsightEmptyState() {
  return (
    <div className="rounded-md border border-dashed border-border bg-card p-6 text-center text-card-foreground">
      <Lightbulb className="mx-auto size-10 text-muted-foreground" />
      <h2 className="mt-4 font-semibold">Belum ada insight</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        Tambahkan transaksi, budget, goal, atau debt agar Vinari bisa memberikan insight berbasis rule.
      </p>
    </div>
  );
}

export function InsightErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-md border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-5 text-destructive" />
        <div>
          <h2 className="font-semibold">Insight gagal dimuat</h2>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          <Button className="mt-4" onClick={onRetry} type="button" variant="outline">
            Coba lagi
          </Button>
        </div>
      </div>
    </div>
  );
}
