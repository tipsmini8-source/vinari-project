import { ArrowLeft, Lightbulb, Sparkles } from 'lucide-react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { GroupedInsightList } from '@features/insight/components/InsightList';
import { InsightEmptyState, InsightErrorState, InsightSkeleton } from '@features/insight/components/InsightStates';
import { useInsights } from '@features/insight/hooks/useInsights';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';

export function InsightsPage() {
  const { loading, workspace } = useWorkspace();
  const insightsQuery = useInsights(workspace?.id);
  const insights = insightsQuery.data ?? [];

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  return (
    <main className="min-h-svh bg-background px-4 pb-28 pt-6 text-foreground sm:py-8">
      <section className="mx-auto w-full max-w-5xl">
        <div className="mb-6">
          <Button asChild className="mb-3" size="sm" variant="ghost">
            <Link to="/app">
              <ArrowLeft className="size-4" />
              Kembali
            </Link>
          </Button>

          <div className="overflow-hidden rounded-[2rem] border border-primary/10 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-primary">
                  <span className="flex size-9 items-center justify-center rounded-2xl bg-primary/10">
                    <Lightbulb className="size-5" />
                  </span>
                  <p className="text-sm font-medium">{workspace.name}</p>
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-normal sm:text-4xl">Saran untuk Kamu</h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  Masukan sederhana agar keuanganmu lebih rapi dan tenang.
                </p>
              </div>
              <span className="hidden size-16 shrink-0 items-center justify-center rounded-[1.75rem] bg-primary text-primary-foreground shadow-lg shadow-primary/20 sm:flex">
                <Sparkles className="size-8" />
              </span>
            </div>
          </div>
        </div>

        {insightsQuery.isLoading ? <InsightSkeleton count={5} /> : null}

        {insightsQuery.isError ? (
          <InsightErrorState
            message={insightsQuery.error instanceof Error ? insightsQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void insightsQuery.refetch()}
          />
        ) : null}

        {!insightsQuery.isLoading && !insightsQuery.isError && insights.length === 0 ? <InsightEmptyState /> : null}

        {!insightsQuery.isLoading && !insightsQuery.isError && insights.length > 0 ? (
          <GroupedInsightList insights={insights} />
        ) : null}
      </section>
    </main>
  );
}
