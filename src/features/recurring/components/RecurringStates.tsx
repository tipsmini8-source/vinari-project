import { AlertCircle, Repeat, WalletCards } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@shared/ui/button';

type EmptyStateProps = {
  canCreate?: boolean;
  createHref: string;
  ctaLabel: string;
  description: string;
  title: string;
};

export function RecurringSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="rounded-md border border-border bg-card p-4 shadow-sm" key={index}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-44 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-56 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-36 animate-pulse rounded bg-secondary" />
            </div>
            <div className="h-9 w-28 animate-pulse rounded bg-secondary" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecurringEmptyState({ canCreate = true, createHref, ctaLabel, description, title }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-border bg-card p-8 text-center text-card-foreground">
      <Repeat className="mx-auto size-10 text-muted-foreground" />
      <h2 className="mt-4 font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      {canCreate ? (
        <Button asChild className="mt-5">
          <Link to={createHref}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}

export function SubscriptionEmptyState({
  canCreate = true,
  createHref,
  ctaLabel,
  description,
  title
}: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-border bg-card p-8 text-center text-card-foreground">
      <WalletCards className="mx-auto size-10 text-muted-foreground" />
      <h2 className="mt-4 font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      {canCreate ? (
        <Button asChild className="mt-5">
          <Link to={createHref}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}

export function RecurringErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-md border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-5 text-destructive" />
        <div>
          <h2 className="font-semibold">Data gagal dimuat</h2>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          <Button className="mt-4" onClick={onRetry} type="button" variant="outline">
            Coba lagi
          </Button>
        </div>
      </div>
    </div>
  );
}
