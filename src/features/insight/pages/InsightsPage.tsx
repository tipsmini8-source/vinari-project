import { ArrowLeft, Lightbulb } from 'lucide-react';
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
    <main className="min-h-svh bg-background px-4 py-8 text-foreground">
      <section className="mx-auto w-full max-w-5xl">
        <div className="mb-6">
          <Button asChild className="mb-3" size="sm" variant="ghost">
            <Link to="/app">
              <ArrowLeft className="size-4" />
              Kembali
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-primary">
            <Lightbulb className="size-5" />
            <p className="text-sm font-medium">{workspace.name}</p>
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">Insights</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Insight otomatis berbasis rule dari transaksi, budget, goal, debt, dan wallet workspace aktif.
          </p>
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
