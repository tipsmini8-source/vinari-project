import { AlertCircle, Lightbulb } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@shared/ui/button';

export function InsightSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <div className="rounded-3xl border border-border bg-card p-4 shadow-sm" key={index}>
          <div className="flex gap-3">
            <div className="size-12 animate-pulse rounded-2xl bg-secondary" />
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
    <div className="rounded-3xl border border-dashed border-border bg-card p-6 text-center text-card-foreground">
      <Lightbulb className="mx-auto size-11 text-primary" />
      <h2 className="mt-4 font-semibold">Belum ada saran khusus</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        Mulai catat uang masuk, uang keluar, target, dan hutang agar Vinari bisa memberi saran yang lebih berguna.
      </p>
      <Button asChild className="mt-5 rounded-full">
        <Link to="/app/record">Catat Sekarang</Link>
      </Button>
    </div>
  );
}

export function InsightErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-5 text-destructive" />
        <div>
          <h2 className="font-semibold">Saran gagal dimuat</h2>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          <Button className="mt-4" onClick={onRetry} type="button" variant="outline">
            Coba lagi
          </Button>
        </div>
      </div>
    </div>
  );
}
