import type { ReactNode } from 'react';

type EmptyStateCardProps = {
  action?: ReactNode;
  description: string;
  title: string;
};

export function EmptyStateCard({ action, description, title }: EmptyStateCardProps) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card p-6 text-center text-card-foreground shadow-sm">
      <h2 className="font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
