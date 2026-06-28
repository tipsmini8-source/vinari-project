import { AlertCircle, WalletCards } from 'lucide-react';

import { Button } from '@shared/ui/button';

export function WalletSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="rounded-3xl border border-border bg-card p-3 shadow-sm" key={index}>
          <div className="flex gap-3">
            <div className="size-[88px] animate-pulse rounded-3xl bg-secondary" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-secondary" />
              <div className="h-3 w-24 animate-pulse rounded bg-secondary" />
              <div className="h-6 w-36 animate-pulse rounded bg-secondary" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function WalletEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center text-card-foreground shadow-sm">
      <WalletCards className="mx-auto size-10 text-muted-foreground" />
      <h2 className="mt-4 font-semibold">Belum ada dompet</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        Tambahkan dompet seperti cash, rekening, atau e-wallet untuk mulai mencatat saldo.
      </p>
      <Button className="mt-5 rounded-xl" onClick={onCreate} type="button">
        Tambah Dompet
      </Button>
    </div>
  );
}

export function WalletErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-5 text-destructive" />
        <div>
          <h2 className="font-semibold">Dompet gagal dimuat</h2>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          <Button className="mt-4" onClick={onRetry} type="button" variant="outline">
            Coba lagi
          </Button>
        </div>
      </div>
    </div>
  );
}
