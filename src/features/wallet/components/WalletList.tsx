import {
  Archive,
  Banknote,
  ChevronRight,
  Edit,
  Landmark,
  MoreVertical,
  Smartphone,
  Trash2,
  WalletCards
} from 'lucide-react';
import { useState } from 'react';

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

const walletTypeBadgeClass: Record<string, string> = {
  bank: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200',
  cash: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-200',
  crypto: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200',
  ewallet: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200',
  'e-wallet': 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200',
  gold: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200',
  investment: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
  other: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  receivable: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-200',
  saving: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200'
};

const walletTypeGradientClass: Record<string, string> = {
  bank: 'from-blue-700 to-cyan-500',
  cash: 'from-teal-500 to-cyan-500',
  crypto: 'from-amber-500 to-orange-500',
  ewallet: 'from-violet-600 to-sky-500',
  'e-wallet': 'from-violet-600 to-sky-500',
  gold: 'from-amber-500 to-yellow-400',
  investment: 'from-emerald-600 to-teal-400',
  other: 'from-blue-600 to-cyan-500',
  receivable: 'from-cyan-600 to-blue-500',
  saving: 'from-blue-600 to-sky-400'
};

function getNormalizedWalletType(type: string) {
  return type.toLowerCase().trim();
}

function getWalletTypeLabel(type: string) {
  return walletTypeLabels[getNormalizedWalletType(type)] ?? 'Lainnya';
}

function getWalletBadgeClass(type: string) {
  return walletTypeBadgeClass[getNormalizedWalletType(type)] ?? walletTypeBadgeClass.other;
}

function getWalletGradientClass(type: string) {
  return walletTypeGradientClass[getNormalizedWalletType(type)] ?? walletTypeGradientClass.other;
}

function WalletIconBlock({ wallet }: { wallet: Wallet }) {
  const normalizedName = wallet.name.trim().toUpperCase();
  const walletType = getNormalizedWalletType(wallet.wallet_type);
  const shouldUseText = walletType === 'bank' && normalizedName.length >= 2 && normalizedName.length <= 4;
  const Icon =
    walletType === 'cash'
      ? Banknote
      : walletType === 'bank'
        ? Landmark
        : walletType === 'ewallet' || walletType === 'e-wallet'
          ? Smartphone
          : WalletCards;

  return (
    <span
      className={cn(
        'flex size-[88px] shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br text-white shadow-lg shadow-slate-950/10',
        getWalletGradientClass(wallet.wallet_type)
      )}
    >
      {shouldUseText ? (
        <span className="max-w-16 truncate text-lg font-bold tracking-wide">{normalizedName}</span>
      ) : (
        <Icon className="size-9" />
      )}
    </span>
  );
}

export function WalletList({
  onArchive,
  onDelete,
  onEdit,
  onSelect,
  selectedWalletId,
  wallets
}: WalletListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {wallets.map((wallet) => (
        <article
          className={cn(
            'relative overflow-visible rounded-3xl border border-border/80 bg-card p-3 text-card-foreground shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)] dark:shadow-none',
            selectedWalletId === wallet.id && 'border-primary ring-2 ring-primary/15'
          )}
          key={wallet.id}
        >
          <div className="flex gap-3">
            <button
              aria-label={`Pilih dompet ${wallet.name}`}
              className="shrink-0"
              onClick={() => onSelect(wallet)}
              type="button"
            >
              <WalletIconBlock wallet={wallet} />
            </button>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <button className="min-w-0 text-left" onClick={() => onSelect(wallet)} type="button">
                  <h2 className="truncate text-base font-semibold leading-6">{wallet.name}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none',
                        getWalletBadgeClass(wallet.wallet_type)
                      )}
                    >
                      {getWalletTypeLabel(wallet.wallet_type)}
                    </span>
                    {wallet.is_archived ? (
                      <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold leading-none text-muted-foreground">
                        Arsip
                      </span>
                    ) : null}
                  </div>
                </button>

                <div className="relative">
                  <Button
                    aria-expanded={openMenuId === wallet.id}
                    aria-label={`Buka menu dompet ${wallet.name}`}
                    className="size-9 rounded-full text-muted-foreground"
                    onClick={() => setOpenMenuId(openMenuId === wallet.id ? null : wallet.id)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                  {openMenuId === wallet.id ? (
                    <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-2xl border border-border bg-popover p-1 text-popover-foreground shadow-xl">
                      <button
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-accent"
                        onClick={() => {
                          setOpenMenuId(null);
                          onEdit(wallet);
                        }}
                        type="button"
                      >
                        <Edit className="size-4" />
                        Edit
                      </button>
                      <button
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={wallet.is_archived}
                        onClick={() => {
                          setOpenMenuId(null);
                          onArchive(wallet);
                        }}
                        type="button"
                      >
                        <Archive className="size-4" />
                        Arsipkan
                      </button>
                      <button
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setOpenMenuId(null);
                          onDelete(wallet);
                        }}
                        type="button"
                      >
                        <Trash2 className="size-4" />
                        Hapus
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <button
                className="mt-2 min-w-0 text-left"
                onClick={() => onSelect(wallet)}
                type="button"
              >
                <span className="block text-xs font-medium text-muted-foreground">Saldo saat ini</span>
                <span
                  className={cn(
                    'mt-0.5 block truncate text-xl font-bold tracking-normal',
                    wallet.current_balance < 0 ? 'text-destructive' : 'text-foreground'
                  )}
                >
                  {moneyFormatter.format(wallet.current_balance)}
                </span>
              </button>

              <div className="mt-auto flex justify-end pt-3">
                <Button
                  className="h-9 rounded-2xl bg-gradient-to-r from-primary to-accent px-3 text-primary-foreground shadow-sm hover:opacity-95"
                  onClick={() => onSelect(wallet)}
                  type="button"
                >
                  Kelola
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
