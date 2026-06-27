import { AlertCircle, Settings } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@shared/ui/button';

export function SettingsSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="rounded-md border border-border bg-card p-5 shadow-sm" key={index}>
          <div className="h-4 w-40 animate-pulse rounded bg-secondary" />
          <div className="mt-3 h-3 w-64 animate-pulse rounded bg-secondary" />
          <div className="mt-5 h-10 w-full animate-pulse rounded bg-secondary" />
        </div>
      ))}
    </div>
  );
}

export function SettingsErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-md border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-5 text-destructive" />
        <div>
          <h2 className="font-semibold">Settings gagal dimuat</h2>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          <Button className="mt-4" onClick={onRetry} type="button" variant="outline">
            Coba lagi
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SettingsSectionCard({
  children,
  description,
  title
}: {
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <section className="rounded-md border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <Settings className="mt-0.5 size-5 text-primary" />
        <div>
          <h2 className="font-semibold">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}
