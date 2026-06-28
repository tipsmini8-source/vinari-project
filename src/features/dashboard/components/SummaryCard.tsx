import type { LucideIcon } from 'lucide-react';

type SummaryCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: 'default' | 'positive' | 'negative';
};

export function SummaryCard({ icon: Icon, label, tone = 'default', value }: SummaryCardProps) {
  const toneClass =
    tone === 'positive' ? 'text-success' : tone === 'negative' ? 'text-destructive' : 'text-foreground';

  return (
    <article className="rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
          <Icon className="size-5" />
        </span>
      </div>
    </article>
  );
}
