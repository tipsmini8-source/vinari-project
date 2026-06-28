import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router';

import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';

const navItems = [
  { href: '/features', label: 'Fitur' },
  { href: '/pricing', label: 'Harga' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' }
];

export function PublicLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-svh bg-[#F4FAFF] text-foreground dark:bg-background">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/85 backdrop-blur-xl dark:border-border dark:bg-background/85">
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-2 font-semibold" to="/">
            <span className="flex size-9 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0F172A_0%,#1D4ED8_60%,#06B6D4_100%)] text-sm font-bold text-white shadow-lg shadow-blue-900/20">
              V
            </span>
            <span>Vinari</span>
            <span className="rounded-full border border-primary/20 bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary">
              Beta
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary',
                    isActive && 'bg-primary-soft text-primary'
                  )
                }
                key={item.href}
                to={item.href}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Button asChild className="rounded-full" variant="ghost">
              <Link to="/login">Masuk</Link>
            </Button>
            <Button asChild className="rounded-full bg-[linear-gradient(135deg,#1D4ED8_0%,#06B6D4_100%)] text-white shadow-lg shadow-blue-900/20 hover:opacity-95">
              <Link to="/register">Mulai Gratis</Link>
            </Button>
          </div>

          <Button aria-label="Buka menu" className="md:hidden" onClick={() => setOpen((value) => !value)} size="icon" type="button" variant="ghost">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </nav>

        {open ? (
          <div className="border-t border-border bg-white px-4 py-4 shadow-xl dark:bg-card md:hidden">
            <div className="grid gap-2">
              {navItems.map((item) => (
                <NavLink
                  className={({ isActive }) =>
                    cn(
                      'rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground',
                      isActive ? 'bg-primary-soft text-primary' : 'hover:bg-muted'
                    )
                  }
                  key={item.href}
                  onClick={() => setOpen(false)}
                  to={item.href}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button asChild className="rounded-2xl" variant="outline">
                <Link onClick={() => setOpen(false)} to="/login">Masuk</Link>
              </Button>
              <Button asChild className="rounded-2xl bg-[linear-gradient(135deg,#1D4ED8_0%,#06B6D4_100%)] text-white">
                <Link onClick={() => setOpen(false)} to="/register">Mulai Gratis</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </header>

      <Outlet />

      <footer className="border-t border-border bg-white/75 dark:bg-card/60">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link className="font-semibold" to="/">Vinari</Link>
              <span className="rounded-full border border-primary/20 bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary">
                Vinari Beta v1.0
              </span>
            </div>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Vinari membantu mencatat dan memahami uang harian dengan cara sederhana.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Butuh bantuan? Hubungi{' '}
              <a className="font-medium text-primary hover:underline" href="mailto:support@vinari.app">
                support@vinari.app
              </a>
            </p>
            <a
              className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
              href="mailto:support@vinari.app?subject=Masukan%20Vinari%20Beta"
            >
              Kirim Masukan
            </a>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-muted-foreground">
            {navItems.map((item) => (
              <Link className="hover:text-primary" key={item.href} to={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
