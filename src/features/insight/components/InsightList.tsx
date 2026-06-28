import { CheckCircle2, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

import { InsightCard, StatusBadge } from '@features/insight/components/InsightCard';
import {
  type FriendlyInsight,
  mapInsightToUserFriendlyInsight
} from '@features/insight/services/insight-view.mapper';
import type { FinancialInsight } from '@features/insight/types/insight.types';
import { Button } from '@shared/ui/button';

export function InsightPreview({ insights }: { insights: FinancialInsight[] }) {
  const previewInsights = insights.map(mapInsightToUserFriendlyInsight).slice(0, 3);

  if (previewInsights.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Saran untuk Kamu</h2>
          <p className="mt-1 text-sm text-muted-foreground">Masukan sederhana agar uangmu lebih rapi.</p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/app/insights">Lihat semua</Link>
        </Button>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {previewInsights.map((insight) => (
          <InsightCard compact insight={insight} key={insight.id} />
        ))}
      </div>
    </section>
  );
}

export function GroupedInsightList({ insights }: { insights: FinancialInsight[] }) {
  const friendlyInsights = insights.map(mapInsightToUserFriendlyInsight);
  const priorityInsights = friendlyInsights.filter((insight) => insight.group === 'priority').slice(0, 2);
  const otherInsights = friendlyInsights.filter((insight) => insight.group === 'other');
  const goodInsights = friendlyInsights.filter((insight) => insight.group === 'good');
  const focusInsight = priorityInsights[0] ?? otherInsights[0] ?? goodInsights[0];

  return (
    <div className="space-y-8">
      <FocusInsightCard insight={focusInsight} />

      {priorityInsights.length > 0 ? (
        <InsightSection
          description="Hal yang sebaiknya dicek lebih dulu."
          insights={priorityInsights}
          title="Saran Prioritas"
        />
      ) : null}

      {otherInsights.length > 0 ? (
        <InsightSection compact description="Masukan tambahan untuk menjaga uang tetap rapi." insights={otherInsights} title="Saran Lainnya" />
      ) : null}

      {goodInsights.length > 0 ? <GoodInsightSection insights={goodInsights} /> : null}
    </div>
  );
}

function FocusInsightCard({ insight }: { insight?: FriendlyInsight }) {
  const safeInsight =
    insight ??
    ({
      actionLabel: 'Lihat Ringkasan',
      actionUrl: '/app/reports',
      group: 'good',
      icon: CheckCircle2,
      id: 'safe-default',
      message: 'Belum ada hal penting yang perlu dicek.',
      statusLabel: 'Kabar Baik',
      statusTone: 'good',
      title: 'Keuanganmu terlihat cukup aman hari ini'
    } satisfies FriendlyInsight);
  const Icon = safeInsight.icon;

  return (
    <section className="overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/12 via-card to-accent/10 p-5 text-card-foreground shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Icon className="size-7" />
          </span>
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-background/75 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/10">
              <Sparkles className="size-3.5" />
              Fokus Hari Ini
            </div>
            <h2 className="text-xl font-semibold tracking-normal sm:text-2xl">{safeInsight.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{safeInsight.message}</p>
            <div className="mt-3">
              <StatusBadge insight={safeInsight} />
            </div>
          </div>
        </div>

        {safeInsight.actionUrl && safeInsight.actionLabel ? (
          <Button asChild className="w-full shrink-0 rounded-full bg-gradient-to-r from-primary to-primary-dark text-primary-foreground sm:w-auto">
            <Link to={safeInsight.actionUrl}>{safeInsight.actionLabel}</Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function InsightSection({
  compact = false,
  description,
  insights,
  title
}: {
  compact?: boolean;
  description: string;
  insights: FriendlyInsight[];
  title: string;
}) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className={compact ? 'grid gap-3' : 'grid gap-3 md:grid-cols-2'}>
        {insights.map((insight) => (
          <InsightCard compact={compact} insight={insight} key={insight.id} />
        ))}
      </div>
    </section>
  );
}

function GoodInsightSection({ insights }: { insights: FriendlyInsight[] }) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-lg font-semibold">Kabar Baik</h2>
        <p className="mt-1 text-sm text-muted-foreground">Hal yang sudah berjalan cukup baik.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {insights.map((insight) => {
          const Icon = insight.icon;

          return (
            <article className="rounded-3xl border border-success/15 bg-success/10 p-4 text-card-foreground" key={insight.id}>
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-success/15 text-success">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{insight.title}</h3>
                    <StatusBadge insight={insight} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{insight.message}</p>
                  {insight.actionUrl && insight.actionLabel ? (
                    <Button asChild className="mt-3 rounded-full" size="sm" variant="outline">
                      <Link to={insight.actionUrl}>{insight.actionLabel}</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
