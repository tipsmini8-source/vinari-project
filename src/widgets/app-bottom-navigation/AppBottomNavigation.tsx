import {
  ArrowDownCircle,
  ArrowRightLeft,
  ArrowUpCircle,
  CreditCard,
  Landmark,
  Plus,
  Repeat,
  Target,
  X
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';

import { appNavigation, isNavigationActive } from '@app/config/navigation';
import { cn } from '@shared/lib/utils';
import { useAppTemplate } from '@shared/theme/use-app-template';
import { Button } from '@shared/ui/button';

const actionItems = [
  {
    description: 'Gaji, bonus, atau pemasukan lain.',
    href: '/app/record?mode=income',
    icon: ArrowDownCircle,
    label: 'Catat Uang Masuk'
  },
  {
    description: 'Belanja, makan, transport, dan kebutuhan harian.',
    href: '/app/record?mode=expense',
    icon: ArrowUpCircle,
    label: 'Catat Uang Keluar'
  },
  {
    description: 'Pindahkan saldo antar dompet.',
    href: '/app/record?mode=transfer',
    icon: ArrowRightLeft,
    label: 'Pindah Saldo'
  },
  {
    description: 'Kurangi sisa hutang dan catat uang keluar.',
    href: '/app/record?mode=debt',
    icon: Landmark,
    label: 'Bayar Hutang / Cicilan'
  },
  {
    description: 'Bayar tagihan rutin dan majukan jatuh tempo.',
    href: '/app/record?mode=subscription',
    icon: CreditCard,
    label: 'Bayar Langganan'
  },
  {
    description: 'Tambah progres target tabungan.',
    href: '/app/record?mode=goal',
    icon: Target,
    label: 'Tambah Tabungan Target'
  },
  {
    description: 'Jalankan template transaksi berulang.',
    href: '/app/record?mode=recurring',
    icon: Repeat,
    label: 'Catat Transaksi Rutin'
  }
];

export function AppBottomNavigation() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { activeColors } = useAppTemplate();
  const firstItems = appNavigation.slice(0, 2);
  const lastItems = appNavigation.slice(2);

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-40 bg-black/35 lg:hidden" onClick={() => setOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 max-h-[86svh] overflow-y-auto rounded-t-[1.75rem] bg-background p-4 pb-[max(env(safe-area-inset-bottom),1rem)] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Catat Uang</h2>
                <p className="text-sm text-muted-foreground">Pilih jenis catatan yang mau dibuat.</p>
              </div>
              <Button aria-label="Tutup" onClick={() => setOpen(false)} size="icon" type="button" variant="ghost">
                <X className="size-5" />
              </Button>
            </div>
            <div className="grid gap-3">
              {actionItems.map(({ description, href, icon: Icon, label }) => (
                <Link
                  className="flex min-h-16 items-center gap-3 rounded-2xl bg-muted/60 p-4 transition-colors hover:bg-accent"
                  key={href}
                  onClick={() => setOpen(false)}
                  to={href}
                >
                  <span
                    className="flex size-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: activeColors.iconSoftBackground, color: activeColors.primaryColor }}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold leading-tight">{label}</span>
                    <span className="mt-1 block text-xs font-normal leading-snug text-muted-foreground">{description}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 items-end gap-1 pb-1">
          {firstItems.map((item) => (
            <BottomLink activeColors={activeColors} item={item} key={item.href} pathname={pathname} />
          ))}

          <button
            className="mx-auto flex -translate-y-3 flex-col items-center gap-1 text-xs font-semibold"
            onClick={() => setOpen(true)}
            style={{ color: activeColors.navActiveColor }}
            type="button"
          >
            <span
              className="flex size-14 items-center justify-center rounded-[1.35rem] text-white shadow-lg"
              style={{
                background: activeColors.centerButtonGradient,
                boxShadow: '0 16px 34px rgba(29, 78, 216, 0.32)'
              }}
            >
              <Plus className="size-8" />
            </span>
            <span>Catat</span>
          </button>

          {lastItems.map((item) => (
            <BottomLink activeColors={activeColors} item={item} key={item.href} pathname={pathname} />
          ))}
        </div>
      </nav>
    </>
  );
}

function BottomLink({
  activeColors,
  item,
  pathname
}: {
  activeColors: ReturnType<typeof useAppTemplate>['activeColors'];
  item: (typeof appNavigation)[number];
  pathname: string;
}) {
  const Icon = item.icon;
  const active = isNavigationActive(pathname, item);

  return (
    <Link
      className={cn(
        'flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-medium transition-colors',
        active ? '' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
      style={active ? { backgroundColor: activeColors.softBackground, color: activeColors.navActiveColor } : undefined}
      to={item.href}
    >
      <Icon aria-hidden="true" className="size-5" />
      <span className="max-w-full truncate">{item.label}</span>
    </Link>
  );
}
