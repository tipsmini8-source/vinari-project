import type React from 'react';
import type { ComponentType, PropsWithChildren } from 'react';
import type { LucideProps } from 'lucide-react';
import { Link } from 'react-router';

import { cn } from '@shared/lib/utils';
import { useAppTemplate } from '@shared/theme/use-app-template';
import { Button } from '@shared/ui/button';

type IconComponent = ComponentType<LucideProps>;

export function AppPage({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <main className={cn('min-h-svh overflow-x-hidden bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8', className)}>
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
        tone === 'positive' && 'bg-success/10',
        tone === 'negative' && 'bg-destructive/10'
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
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
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
  style,
  tone = 'default',
  to,
  ...props
}: React.ComponentProps<typeof Button> & {
  icon: IconComponent;
  label: string;
  tone?: 'default' | 'income' | 'expense';
  to?: string;
}) {
  const { activeColors } = useAppTemplate();
  const gradientByTone = {
    default: activeColors.centerButtonGradient,
    expense: 'linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)',
    income: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)'
  };
  const content = (
    <>
      <span className="flex size-9 items-center justify-center rounded-full bg-white/20 shadow-inner shadow-white/10 sm:size-10">
        <Icon className="size-5 sm:size-6" />
      </span>
      <span className="text-xs font-semibold leading-tight text-white sm:text-sm">{label}</span>
    </>
  );

  return (
    <Button
      asChild={Boolean(to)}
      className={cn(
        'h-auto min-h-[5.75rem] flex-1 flex-col gap-2 rounded-[1.35rem] px-3 py-4 text-center text-white shadow-lg transition-all hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0 dark:text-white'
      )}
      style={{
        background: gradientByTone[tone],
        boxShadow: '0 14px 30px rgba(15, 23, 42, 0.14)',
        ...style
      }}
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
        tone === 'good' && 'bg-success/10 text-success',
        tone === 'warn' && 'bg-warning/15 text-warning',
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
    <div className="rounded-2xl border border-warning/30 bg-warning/10 p-5">
      <h2 className="font-semibold text-warning">Fitur Premium</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
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
