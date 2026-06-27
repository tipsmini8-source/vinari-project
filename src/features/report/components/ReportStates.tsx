import { AlertCircle, FileText } from 'lucide-react';

import { Button } from '@shared/ui/button';

export function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="rounded-md border border-border bg-card p-4 shadow-sm" key={index}>
            <div className="h-4 w-28 animate-pulse rounded bg-secondary" />
            <div className="mt-3 h-8 w-36 animate-pulse rounded bg-secondary" />
          </div>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="h-48 animate-pulse rounded-md bg-secondary" key={index} />
        ))}
      </div>
    </div>
  );
}

export function ReportEmptyState() {
  return (
    <div className="rounded-md border border-dashed border-border bg-card p-8 text-center">
      <FileText className="mx-auto size-10 text-muted-foreground" />
      <h2 className="mt-4 font-semibold">Laporan belum memiliki data</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        Tambahkan transaksi, budget, goal, atau hutang untuk mulai melihat laporan keuangan.
      </p>
    </div>
  );
}

export function ReportErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-md border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-5 text-destructive" />
        <div>
          <h2 className="font-semibold">Laporan gagal dimuat</h2>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          <Button className="mt-4" onClick={onRetry} type="button" variant="outline">
            Coba lagi
          </Button>
        </div>
      </div>
    </div>
  );
}
