import type React from 'react';
import type { ComponentType, PropsWithChildren } from 'react';
import type { LucideProps } from 'lucide-react';
import { Link } from 'react-router';

import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';

type IconComponent = ComponentType<LucideProps>;

export function AppPage({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <main className={cn('min-h-svh overflow-x-hidden bg-muted/30 px-4 py-6 text-foreground sm:px-6 lg:px-8', className)}>
      <section className="mx-auto w-full max-w-6xl">{children}</section>
    </main>
  );
}

export function PageHeader({
  action,
  description,
  eyebrow,
  title
}: {
  action?: React.ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="text-sm font-medium text-primary">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-normal sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function SectionHeader({ action, title }: { action?: React.ReactNode; title: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold tracking-normal">{title}</h2>
      {action}
    </div>
  );
}

export function MoneyCard({
  label,
  tone = 'default',
  value
}: {
  label: string;
  tone?: 'default' | 'positive' | 'negative';
  value: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm',
        tone === 'positive' && 'bg-emerald-500/10',
        tone === 'negative' && 'bg-rose-500/10'
      )}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-xl font-semibold tracking-normal">{value}</p>
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value
}: {
  icon?: IconComponent;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
        ) : null}
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 break-words text-xl font-semibold tracking-normal">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function QuickActionButton({
  icon: Icon,
  label,
  tone = 'default',
  to,
  ...props
}: React.ComponentProps<typeof Button> & {
  icon: IconComponent;
  label: string;
  tone?: 'default' | 'income' | 'expense';
  to?: string;
}) {
  const content = (
    <>
      <Icon className="size-5" />
      <span className="text-xs font-semibold leading-tight sm:text-sm">{label}</span>
    </>
  );

  return (
    <Button
      asChild={Boolean(to)}
      className={cn(
        'h-auto min-h-20 flex-1 flex-col gap-2 rounded-2xl px-3 py-4 text-center shadow-sm',
        tone === 'income' && 'bg-emerald-600 text-white hover:bg-emerald-700',
        tone === 'expense' && 'bg-rose-600 text-white hover:bg-rose-700'
      )}
      {...props}
    >
      {to ? <Link to={to}>{content}</Link> : content}
    </Button>
  );
}

export function StatusBadge({ children, tone = 'default' }: PropsWithChildren<{ tone?: 'default' | 'good' | 'warn' | 'bad' }>) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium',
        tone === 'default' && 'bg-secondary text-secondary-foreground',
        tone === 'good' && 'bg-emerald-500/10 text-emerald-700',
        tone === 'warn' && 'bg-amber-500/10 text-amber-700',
        tone === 'bad' && 'bg-destructive/10 text-destructive'
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  action,
  description,
  icon: Icon,
  title
}: {
  action?: React.ReactNode;
  description: string;
  icon?: IconComponent;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-card-foreground">
      {Icon ? <Icon className="mx-auto size-10 text-muted-foreground" /> : null}
      <h2 className="mt-4 font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm" key={index}>
          <div className="h-4 w-2/3 animate-pulse rounded bg-secondary" />
          <div className="mt-3 h-8 w-1/2 animate-pulse rounded bg-secondary" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry, title = 'Data gagal dimuat' }: { message: string; onRetry?: () => void; title?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button className="mt-4 rounded-xl" onClick={onRetry} type="button" variant="outline">
          Coba lagi
        </Button>
      ) : null}
    </div>
  );
}

export function PremiumLockCard({ description = 'Upgrade Premium untuk membuka fitur ini.' }: { description?: string }) {
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
      <h2 className="font-semibold text-amber-800">Fitur Premium</h2>
      <p className="mt-1 text-sm leading-6 text-amber-800/80">{description}</p>
      <Button asChild className="mt-4 rounded-xl" size="sm">
        <Link to="/app/upgrade">Upgrade Premium</Link>
      </Button>
    </div>
  );
}

export function ConfirmDialog({
  confirmLabel = 'Ya, lanjutkan',
  message,
  onConfirm,
  title
}: {
  confirmLabel?: string;
  message: string;
  onConfirm: () => void;
  title: string;
}) {
  return (
    <Button
      className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
      onClick={() => {
        if (window.confirm(`${title}\n\n${message}`)) {
          onConfirm();
        }
      }}
      type="button"
      variant="outline"
    >
      {confirmLabel}
    </Button>
  );
}

export function MobileActionBar({ children }: PropsWithChildren) {
  return (
    <div className="sticky bottom-20 z-10 -mx-4 mt-6 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
      {children}
    </div>
  );
}
