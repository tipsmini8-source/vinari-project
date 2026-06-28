import { AlertCircle, Sparkles } from 'lucide-react';

import { Button } from '@shared/ui/button';

export function PremiumSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="rounded-md border border-border bg-card p-5 shadow-sm" key={index}>
          <div className="h-5 w-32 animate-pulse rounded bg-secondary" />
          <div className="mt-3 h-8 w-36 animate-pulse rounded bg-secondary" />
          <div className="mt-5 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-secondary" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-secondary" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-secondary" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PremiumErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-md border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-5 text-destructive" />
        <div>
          <h2 className="font-semibold">Pembayaran gagal dimuat</h2>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          <Button className="mt-4" onClick={onRetry} type="button" variant="outline">
            Coba lagi
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PremiumEmptyRequests() {
  return (
    <div className="rounded-md border border-dashed border-border bg-card p-8 text-center text-card-foreground">
      <Sparkles className="mx-auto size-10 text-muted-foreground" />
      <h2 className="mt-4 font-semibold">Belum ada permintaan upgrade</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        Permintaan upgrade yang dibuat dari halaman Upgrade akan muncul di sini.
      </p>
    </div>
  );
}
