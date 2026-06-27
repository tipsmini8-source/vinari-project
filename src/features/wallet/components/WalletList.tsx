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
            'rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm transition-colors',
            selectedWalletId === wallet.id && 'border-primary'
          )}
          key={wallet.id}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <button className="flex flex-1 items-start gap-3 text-left" onClick={() => onSelect(wallet)} type="button">
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-md text-white"
                style={{ backgroundColor: wallet.color ?? '#0f766e' }}
              >
                <WalletCards className="size-5" />
              </span>
              <span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold">{wallet.name}</span>
                  {wallet.is_archived ? (
                    <span className="rounded-sm bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                      Archived
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">{wallet.wallet_type}</span>
                <span className="mt-2 block text-sm font-medium">
                  {moneyFormatter.format(wallet.initial_balance)}
                </span>
              </span>
            </button>
            <div className="flex gap-2 sm:justify-end">
              <Button aria-label="Edit wallet" onClick={() => onEdit(wallet)} size="icon" type="button" variant="ghost">
                <Edit className="size-4" />
              </Button>
              <Button
                aria-label="Arsipkan wallet"
                disabled={wallet.is_archived}
                onClick={() => onArchive(wallet)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Archive className="size-4" />
              </Button>
              <Button
                aria-label="Hapus wallet"
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
