import { Outlet } from 'react-router';

import { ThemeToggle } from '@shared/ui/theme-toggle';

export function AuthLayout() {
  return (
    <main className="grid min-h-svh bg-background text-foreground lg:grid-cols-[1fr_28rem]">
      <section className="hidden border-r border-border bg-secondary/40 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex size-11 items-center justify-center rounded-md bg-primary text-lg font-semibold text-primary-foreground">
            V
          </div>
          <h1 className="mt-8 max-w-md text-4xl font-semibold tracking-normal">
            Personal & Family Financial Operating System
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          Shell autentikasi Vinari disiapkan untuk sign in, onboarding, dan pemulihan akun.
        </p>
      </section>
      <section className="flex min-h-svh flex-col">
        <header className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground lg:hidden">
              V
            </div>
            <span className="text-sm font-semibold">Vinari</span>
          </div>
          <ThemeToggle />
        </header>
        <div className="flex flex-1 items-center justify-center px-4 py-10">
          <Outlet />
        </div>
      </section>
    </main>
  );
}
