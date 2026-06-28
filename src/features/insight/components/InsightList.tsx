import { Link } from 'react-router';

import { InsightCard } from '@features/insight/components/InsightCard';
import type { FinancialInsight, InsightPriority } from '@features/insight/types/insight.types';
import { Button } from '@shared/ui/button';

const priorityLabels: Record<InsightPriority, string> = {
  high: 'Prioritas Tinggi',
  low: 'Prioritas Rendah',
  medium: 'Prioritas Sedang'
};

const priorities: InsightPriority[] = ['high', 'medium', 'low'];

export function InsightPreview({ insights }: { insights: FinancialInsight[] }) {
  const previewInsights = insights.slice(0, 3);

  if (previewInsights.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Saran Terpenting</h2>
          <p className="mt-1 text-sm text-muted-foreground">Saran sederhana dari data ruang keuangan aktif.</p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/app/insights">Lihat semua</Link>
        </Button>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {previewInsights.map((insight) => (
          <InsightCard insight={insight} key={insight.id} />
        ))}
      </div>
    </section>
  );
}

export function GroupedInsightList({ insights }: { insights: FinancialInsight[] }) {
  return (
    <div className="space-y-6">
      {priorities.map((priority) => {
        const items = insights.filter((insight) => insight.priority === priority);

        if (items.length === 0) {
          return null;
        }

        return (
          <section key={priority}>
            <div className="mb-3">
              <h2 className="text-lg font-semibold">{priorityLabels[priority]}</h2>
              <p className="text-sm text-muted-foreground">{items.length} saran</p>
            </div>
            <div className="grid gap-3">
              {items.map((insight) => (
                <InsightCard insight={insight} key={insight.id} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
