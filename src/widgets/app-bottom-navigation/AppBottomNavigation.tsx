import { ArrowDownCircle, ArrowRightLeft, ArrowUpCircle, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';

import { appNavigation, isNavigationActive } from '@app/config/navigation';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';

const actionItems = [
  {
    href: '/app/transactions/new?type=income',
    icon: ArrowDownCircle,
    label: 'Catat Uang Masuk'
  },
  {
    href: '/app/transactions/new?type=expense',
    icon: ArrowUpCircle,
    label: 'Catat Uang Keluar'
  },
  {
    href: '/app/transactions/new?type=transfer',
    icon: ArrowRightLeft,
    label: 'Pindah Saldo'
  }
];

export function AppBottomNavigation() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const firstItems = appNavigation.slice(0, 2);
  const lastItems = appNavigation.slice(2);

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-40 bg-black/35 lg:hidden" onClick={() => setOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-[1.75rem] bg-background p-4 pb-[max(env(safe-area-inset-bottom),1rem)] shadow-2xl"
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
              {actionItems.map(({ href, icon: Icon, label }) => (
                <Link
                  className="flex min-h-14 items-center gap-3 rounded-2xl bg-muted/60 p-4 font-semibold transition-colors hover:bg-accent"
                  key={href}
                  onClick={() => setOpen(false)}
                  to={href}
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 items-end gap-1 pb-1">
          {firstItems.map((item) => (
            <BottomLink item={item} key={item.href} pathname={pathname} />
          ))}

          <button
            className="mx-auto flex -translate-y-3 flex-col items-center gap-1 text-xs font-semibold text-primary"
            onClick={() => setOpen(true)}
            type="button"
          >
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <Plus className="size-7" />
            </span>
            <span>Catat</span>
          </button>

          {lastItems.map((item) => (
            <BottomLink item={item} key={item.href} pathname={pathname} />
          ))}
        </div>
      </nav>
    </>
  );
}

function BottomLink({ item, pathname }: { item: (typeof appNavigation)[number]; pathname: string }) {
  const Icon = item.icon;

  return (
    <Link
      className={cn(
        'flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-medium transition-colors',
        isNavigationActive(pathname, item)
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
      to={item.href}
    >
      <Icon aria-hidden="true" className="size-5" />
      <span className="max-w-full truncate">{item.label}</span>
    </Link>
  );
}
