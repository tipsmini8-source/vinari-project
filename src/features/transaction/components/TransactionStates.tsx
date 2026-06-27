import { AlertCircle, ReceiptText } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@shared/ui/button';

export function TransactionSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="rounded-md border border-border bg-card p-4 shadow-sm" key={index}>
          <div className="flex gap-3">
            <div className="size-10 animate-pulse rounded-md bg-secondary" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-64 max-w-full animate-pulse rounded bg-secondary" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TransactionEmptyState() {
  return (
    <div className="rounded-md border border-dashed border-border bg-card p-8 text-center">
      <ReceiptText className="mx-auto size-10 text-muted-foreground" />
      <h2 className="mt-4 font-semibold">Belum ada transaksi</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        Catat pemasukan, pengeluaran, atau transfer pertama untuk mulai melihat riwayat transaksi.
      </p>
      <Button asChild className="mt-5">
        <Link to="/app/transactions/new">Tambah Transaksi</Link>
      </Button>
    </div>
  );
}

export function TransactionErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-md border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-5 text-destructive" />
        <div>
          <h2 className="font-semibold">Transaksi gagal dimuat</h2>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          <Button className="mt-4" onClick={onRetry} type="button" variant="outline">
            Coba lagi
          </Button>
        </div>
      </div>
    </div>
  );
}
