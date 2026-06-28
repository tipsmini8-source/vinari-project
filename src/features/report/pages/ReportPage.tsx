import {
  ArrowDownCircle,
  ArrowLeft,
  ArrowRightLeft,
  ArrowUpCircle,
  BarChart3,
  Download,
  Landmark,
  Loader2,
  Lock,
  Target
} from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import {
  FinancialHealthCard,
  FinancialHealthDetails,
  FinancialHealthEmptyState,
  FinancialHealthErrorState,
  FinancialHealthSkeleton,
  isFinancialHealthDataEmpty,
  useFinancialHealthScore
} from '@features/financial-health';
import { usePlan } from '@features/premium';
import { ReportFilterBar } from '@features/report/components/ReportFilterBar';
import { getCurrentMonthFilters } from '@features/report/components/report-filter-utils';
import { ReportEmptyState, ReportErrorState, ReportSkeleton } from '@features/report/components/ReportStates';
import { ReportSummaryCard } from '@features/report/components/ReportSummaryCard';
import { CategoryBreakdownTable, WalletSummaryTable } from '@features/report/components/ReportTables';
import { useExportReport, useReport } from '@features/report/hooks/useReport';
import type { ReportFilters } from '@features/report/types/report.types';
import { Button } from '@shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';
import { downloadCSV } from '@shared/utils/csv';

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  style: 'currency',
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium'
});

export function ReportPage() {
  const [filters, setFilters] = useState<ReportFilters>(() => getCurrentMonthFilters());
  const navigate = useNavigate();
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const planQuery = usePlan();
  const reportQuery = useReport(workspace?.id, filters);
  const financialHealthQuery = useFinancialHealthScore(workspace?.id);
  const exportReport = useExportReport(workspace?.id);
  const report = reportQuery.data;
  const isEmpty = report
    ? report.monthly.totalIncome === 0 &&
      report.monthly.totalExpense === 0 &&
      report.wallets.length === 0 &&
      report.budget.activeBudgetCount === 0 &&
      report.goal.activeGoalCount === 0 &&
      report.debt.activeDebtCount === 0
    : false;

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  const handleExport = async () => {
    const canExport = planQuery.isPremium && planQuery.hasFeature('export');

    if (!canExport) {
      void navigate('/app/upgrade');
      return;
    }

    try {
      const csv = await exportReport.mutateAsync(filters);
      downloadCSV(`vinari-report-${new Date().toISOString().slice(0, 10)}.csv`, csv);
      toast({ title: 'Unduh laporan selesai' });
    } catch (error) {
      toast({
        title: 'Gagal mengunduh laporan',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  return (
    <main className="min-h-svh bg-background px-4 py-8 text-foreground">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button asChild className="mb-3" size="sm" variant="ghost">
              <Link to="/app">
                <ArrowLeft className="size-4" />
                Kembali
              </Link>
            </Button>
            <p className="text-sm font-medium text-primary">{workspace.name}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Laporan</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Laporan dasar catatan uang, batas pengeluaran, target tabungan, cicilan, dan dompet untuk periode pilihan.
            </p>
          </div>
          <Button
            disabled={exportReport.isPending || planQuery.isLoading}
            onClick={handleExport}
            type="button"
            variant="outline"
          >
            {exportReport.isPending || planQuery.isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : planQuery.isPremium && planQuery.hasFeature('export') ? (
              <Download className="size-4" />
            ) : (
              <Lock className="size-4" />
            )}
            Unduh Laporan CSV
          </Button>
        </div>

        <div className="space-y-6">
          <ReportFilterBar filters={filters} onChange={setFilters} />

          {financialHealthQuery.isLoading ? <FinancialHealthSkeleton /> : null}

          {financialHealthQuery.isError ? (
            <FinancialHealthErrorState
              message={
                financialHealthQuery.error instanceof Error
                  ? financialHealthQuery.error.message
                  : 'Terjadi kesalahan.'
              }
              onRetry={() => void financialHealthQuery.refetch()}
            />
          ) : null}

          {financialHealthQuery.data && !isFinancialHealthDataEmpty(financialHealthQuery.data) ? (
            <div className="grid gap-3">
              <FinancialHealthCard score={financialHealthQuery.data} />
              <FinancialHealthDetails score={financialHealthQuery.data} />
            </div>
          ) : !financialHealthQuery.isLoading && !financialHealthQuery.isError ? (
            <FinancialHealthEmptyState />
          ) : null}

          {reportQuery.isLoading ? <ReportSkeleton /> : null}

          {reportQuery.isError ? (
            <ReportErrorState
              message={reportQuery.error instanceof Error ? reportQuery.error.message : 'Terjadi kesalahan.'}
              onRetry={() => void reportQuery.refetch()}
            />
          ) : null}

          {report && isEmpty ? <ReportEmptyState /> : null}

          {report && !isEmpty ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <ReportSummaryCard
                  icon={ArrowDownCircle}
                  label="Total uang masuk"
                  tone="positive"
                  value={moneyFormatter.format(report.monthly.totalIncome)}
                />
                <ReportSummaryCard
                  icon={ArrowUpCircle}
                  label="Total uang keluar"
                  tone="negative"
                  value={moneyFormatter.format(report.monthly.totalExpense)}
                />
                <ReportSummaryCard
                  icon={ArrowRightLeft}
                  label="Selisih uang"
                  tone={report.monthly.cashflow >= 0 ? 'positive' : 'negative'}
                  value={moneyFormatter.format(report.monthly.cashflow)}
                />
                <ReportSummaryCard
                  icon={BarChart3}
                  label="Rasio menabung"
                  tone={report.monthly.savingRate >= 0 ? 'positive' : 'negative'}
                  value={`${report.monthly.savingRate}%`}
                />
              </div>

              <div className="grid gap-3 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <BarChart3 className="size-5" />
                      Batas Pengeluaran
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <ReportLine label="Batas aktif" value={String(report.budget.activeBudgetCount)} />
                    <ReportLine label="Total batas" value={moneyFormatter.format(report.budget.totalBudget)} />
                    <ReportLine label="Total terpakai" value={moneyFormatter.format(report.budget.totalUsed)} />
                    <ReportLine label="Melewati batas" value={String(report.budget.overBudgetCount)} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Target className="size-5" />
                      Target Tabungan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <ReportLine label="Target aktif" value={String(report.goal.activeGoalCount)} />
                    <ReportLine label="Total target" value={moneyFormatter.format(report.goal.totalTarget)} />
                    <ReportLine label="Terkumpul" value={moneyFormatter.format(report.goal.totalCollected)} />
                    <ReportLine label="Progress rata-rata" value={`${report.goal.averageProgress}%`} />
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(Math.max(report.goal.averageProgress, 0), 100)}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Landmark className="size-5" />
                      Cicilan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <ReportLine label="Hutang aktif" value={String(report.debt.activeDebtCount)} />
                    <ReportLine label="Total sisa hutang" value={moneyFormatter.format(report.debt.totalRemainingDebt)} />
                    <div className="rounded-md border border-border p-3">
                      <p className="text-muted-foreground">Hutang terdekat</p>
                      {report.debt.nearestDebt ? (
                        <p className="mt-1 font-medium">
                          {report.debt.nearestDebt.name} -{' '}
                          {dateFormatter.format(new Date(report.debt.nearestDebt.due_date ?? ''))}
                        </p>
                      ) : (
                        <p className="mt-1 font-medium">-</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <CategoryBreakdownTable
                  emptyLabel="Tidak ada pengeluaran pada periode ini."
                  items={report.expenseByCategory}
                  title="Pengeluaran per Kategori"
                />
                <CategoryBreakdownTable
                  emptyLabel="Tidak ada pemasukan pada periode ini."
                  items={report.incomeByCategory}
                  title="Pemasukan per Kategori"
                />
              </div>

              <WalletSummaryTable wallets={report.wallets} />
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function ReportLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
