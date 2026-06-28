import { AlertCircle, Calculator } from 'lucide-react';

import { Button } from '@shared/ui/button';

export function SimulatorSkeleton() {
  return (
    <div className="grid gap-3">
      <div className="rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="h-5 w-40 animate-pulse rounded bg-secondary" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="h-10 animate-pulse rounded bg-secondary" key={index} />
          ))}
        </div>
      </div>
      <div className="h-40 animate-pulse rounded-md bg-secondary" />
    </div>
  );
}

export function SimulatorErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-md border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-5 text-destructive" />
        <div>
          <h2 className="font-semibold">Simulator gagal dimuat</h2>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          <Button className="mt-4" onClick={onRetry} type="button" variant="outline">
            Coba lagi
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SimulatorEmptyState() {
  return (
    <div className="rounded-md border border-dashed border-border bg-card p-8 text-center text-card-foreground">
      <Calculator className="mx-auto size-10 text-muted-foreground" />
      <h2 className="mt-4 font-semibold">Data belum cukup</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        Tambahkan dompet aktif dan catatan uang agar simulasi keputusan lebih bermakna.
      </p>
    </div>
  );
}
