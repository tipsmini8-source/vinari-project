import { Archive, Edit, Trash2, WalletCards } from 'lucide-react';

import type { Wallet } from '@features/wallet/types/wallet.types';
import { Button } from '@shared/ui/button';
import { cn } from '@shared/lib/utils';

type WalletListProps = {
  selectedWalletId?: string;
  wallets: Wallet[];
  onArchive: (wallet: Wallet) => void;
  onDelete: (wallet: Wallet) => void;
  onEdit: (wallet: Wallet) => void;
  onSelect: (wallet: Wallet) => void;
};

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  style: 'currency',
  maximumFractionDigits: 0
});

const walletTypeLabels: Record<string, string> = {
  bank: 'Bank',
  cash: 'Cash',
  crypto: 'Crypto',
  ewallet: 'E-Wallet',
  gold: 'Emas',
  investment: 'Investasi',
  other: 'Lainnya',
  receivable: 'Piutang',
  saving: 'Tabungan'
};

export function WalletList({
  onArchive,
  onDelete,
  onEdit,
  onSelect,
  selectedWalletId,
  wallets
}: WalletListProps) {
  return (
    <div className="grid gap-3">
      {wallets.map((wallet) => (
        <article
          className={cn(
            'rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm transition-colors',
            selectedWalletId === wallet.id && 'border-primary'
          )}
          key={wallet.id}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <button className="flex flex-1 items-start gap-3 text-left" onClick={() => onSelect(wallet)} type="button">
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-white"
                style={{ backgroundColor: wallet.color ?? '#0077B6' }}
              >
                <WalletCards className="size-5" />
              </span>
              <span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold">{wallet.name}</span>
                  {wallet.is_archived ? (
                    <span className="rounded-sm bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                      Arsip
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {walletTypeLabels[wallet.wallet_type] ?? 'Dompet'}
                </span>
                <span className="mt-2 block text-sm font-medium">{moneyFormatter.format(wallet.current_balance)}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">Saldo saat ini</span>
              </span>
            </button>
            <div className="flex gap-2 sm:justify-end">
              <Button aria-label="Edit dompet" onClick={() => onEdit(wallet)} size="icon" type="button" variant="ghost">
                <Edit className="size-4" />
              </Button>
              <Button
                aria-label="Arsipkan dompet"
                disabled={wallet.is_archived}
                onClick={() => onArchive(wallet)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Archive className="size-4" />
              </Button>
              <Button
                aria-label="Hapus dompet"
                onClick={() => onDelete(wallet)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
