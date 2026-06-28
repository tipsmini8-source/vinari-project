import type { FinancialHealthScore } from '@features/financial-health/types/financial-health.types';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card';

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  maximumFractionDigits: 0,
  style: 'currency'
});

function formatRatio(value: number | null) {
  if (value === null) {
    return '-';
  }

  return `${Math.round(value * 100)}%`;
}

function formatMonths(value: number | null) {
  if (value === null) {
    return '-';
  }

  return `${value.toFixed(1)} bulan`;
}

export function FinancialHealthDetails({ score }: { score: FinancialHealthScore }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Detail Kondisi Keuangan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {score.components.map((component) => {
            const percentage = component.maxScore > 0 ? (component.score / component.maxScore) * 100 : 0;

            return (
              <div className="rounded-md border border-border p-4" key={component.key}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{component.label}</p>
                    <p className="mt-1 text-xl font-semibold">
                      {component.score}/{component.maxScore}
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} />
                </div>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">{component.description}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-md border border-border p-4">
            <h3 className="font-semibold">Ringkasan angka</h3>
            <div className="mt-4 space-y-3 text-sm">
              <DetailLine label="Uang masuk bulan ini" value={moneyFormatter.format(score.metrics.monthlyIncome)} />
              <DetailLine label="Uang keluar bulan ini" value={moneyFormatter.format(score.metrics.monthlyExpense)} />
              <DetailLine label="Selisih uang bulan ini" value={moneyFormatter.format(score.metrics.monthlyCashflow)} />
              <DetailLine label="Total hutang aktif" value={moneyFormatter.format(score.metrics.activeDebtTotal)} />
              <DetailLine label="Perbandingan hutang dan uang masuk" value={formatRatio(score.metrics.debtToIncomeRatio)} />
              <DetailLine label="Saldo dompet aktif" value={moneyFormatter.format(score.metrics.totalWalletBalance)} />
              <DetailLine
                label="Rata-rata uang keluar bulanan"
                value={moneyFormatter.format(score.metrics.averageMonthlyExpense)}
              />
              <DetailLine label="Estimasi dana darurat" value={formatMonths(score.metrics.emergencyFundMonths)} />
            </div>
          </div>

          <div className="rounded-md border border-border p-4">
            <h3 className="font-semibold">Rekomendasi</h3>
            <div className="mt-4 space-y-3">
              {score.recommendations.map((recommendation) => (
                <div className="rounded-md bg-secondary/60 p-3 text-sm leading-6 text-secondary-foreground" key={recommendation}>
                  {recommendation}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
