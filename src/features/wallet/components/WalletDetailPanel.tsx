import { CalendarDays, ReceiptText, WalletCards } from 'lucide-react';

import type { WalletDetail } from '@features/wallet/types/wallet.types';

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  style: 'currency',
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium'
});

type WalletDetailPanelProps = {
  detail?: WalletDetail;
  isLoading: boolean;
};

export function WalletDetailPanel({ detail, isLoading }: WalletDetailPanelProps) {
  if (isLoading) {
    return (
      <aside className="rounded-md border border-border bg-card p-6 shadow-sm">
        <div className="h-5 w-32 animate-pulse rounded bg-secondary" />
        <div className="mt-4 h-8 w-48 animate-pulse rounded bg-secondary" />
        <div className="mt-6 grid gap-3">
          <div className="h-16 animate-pulse rounded bg-secondary" />
          <div className="h-16 animate-pulse rounded bg-secondary" />
        </div>
      </aside>
    );
  }

  if (!detail) {
    return (
      <aside className="rounded-md border border-border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm text-muted-foreground">Pilih wallet untuk melihat detail.</p>
      </aside>
    );
  }

  return (
    <aside className="rounded-md border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex items-start gap-3">
        <span
          className="flex size-10 items-center justify-center rounded-md text-white"
          style={{ backgroundColor: detail.color ?? '#0f766e' }}
        >
          <WalletCards className="size-5" />
        </span>
        <div>
          <h2 className="font-semibold">{detail.name}</h2>
          <p className="text-sm text-muted-foreground">{detail.wallet_type}</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-3">
        <div className="rounded-md border border-border p-4">
          <dt className="text-sm text-muted-foreground">Saldo saat ini</dt>
          <dd className="mt-1 text-2xl font-semibold">{moneyFormatter.format(detail.current_balance)}</dd>
        </div>
        <div className="rounded-md border border-border p-4">
          <dt className="text-sm text-muted-foreground">Saldo awal</dt>
          <dd className="mt-1 font-semibold">{moneyFormatter.format(detail.initial_balance)}</dd>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-border p-4">
            <ReceiptText className="mb-2 size-4 text-muted-foreground" />
            <dt className="text-sm text-muted-foreground">Transaksi</dt>
            <dd className="mt-1 font-semibold">{detail.transaction_count}</dd>
          </div>
          <div className="rounded-md border border-border p-4">
            <CalendarDays className="mb-2 size-4 text-muted-foreground" />
            <dt className="text-sm text-muted-foreground">Dibuat</dt>
            <dd className="mt-1 font-semibold">{dateFormatter.format(new Date(detail.created_at))}</dd>
          </div>
        </div>
      </dl>
    </aside>
  );
}
