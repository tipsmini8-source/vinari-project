import {
  ArrowDownCircle,
  ArrowRightLeft,
  ArrowUpCircle,
  BarChart3,
  Landmark,
  Target,
  WalletCards
} from 'lucide-react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import {
  DashboardEmptyState,
  DashboardErrorState,
  DashboardSkeleton
} from '@features/dashboard/components/DashboardStates';
import { RecentTransactions } from '@features/dashboard/components/RecentTransactions';
import { SummaryCard } from '@features/dashboard/components/SummaryCard';
import { useDashboardSummary } from '@features/dashboard/hooks/useDashboard';
import {
  FinancialHealthCard,
  FinancialHealthEmptyState,
  FinancialHealthErrorState,
  FinancialHealthSkeleton,
  isFinancialHealthDataEmpty,
  useFinancialHealthScore
} from '@features/financial-health';
import { Button } from '@shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card';
import { GlobalLoading } from '@shared/ui/global-loading';

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  style: 'currency',
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium'
});

export function DashboardPage() {
  const { loading, workspace } = useWorkspace();
  const dashboardQuery = useDashboardSummary(workspace?.id);
  const financialHealthQuery = useFinancialHealthScore(workspace?.id);
  const summary = dashboardQuery.data;
  const isEmpty = summary
    ? summary.activeWalletCount === 0 &&
      summary.recentTransactions.length === 0 &&
      summary.activeBudgetCount === 0 &&
      summary.activeGoalCount === 0 &&
      summary.achievedGoalCount === 0 &&
      summary.activeDebtCount === 0
    : false;

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  return (
    <main className="min-h-svh bg-background px-4 py-8 text-foreground">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">{workspace.name}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Dashboard Vinari</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ringkasan utama wallet, transaksi, budget, goal, dan hutang workspace aktif.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link to="/app/transactions/new">
                <ArrowDownCircle className="size-4" />
                Tambah Income
              </Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link to="/app/transactions/new">
                <ArrowUpCircle className="size-4" />
                Tambah Expense
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/app/transactions/new">
                <ArrowRightLeft className="size-4" />
                Tambah Transfer
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/app/budgets/new">
                <BarChart3 className="size-4" />
                Tambah Budget
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/app/goals/new">
                <Target className="size-4" />
                Tambah Goal
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/app/debts/new">
                <Landmark className="size-4" />
                Tambah Hutang
              </Link>
            </Button>
          </div>
        </div>

        {dashboardQuery.isLoading ? <DashboardSkeleton /> : null}

        {dashboardQuery.isError ? (
          <DashboardErrorState
            message={dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void dashboardQuery.refetch()}
          />
        ) : null}

        {summary && isEmpty ? <DashboardEmptyState /> : null}

        {summary && !isEmpty ? (
          <div className="space-y-6">
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
              <FinancialHealthCard score={financialHealthQuery.data} showDetailsLink />
            ) : !financialHealthQuery.isLoading && !financialHealthQuery.isError ? (
              <FinancialHealthEmptyState />
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                icon={WalletCards}
                label="Total saldo wallet"
                value={moneyFormatter.format(summary.totalWalletBalance)}
              />
              <SummaryCard
                icon={ArrowDownCircle}
                label="Income bulan ini"
                tone="positive"
                value={moneyFormatter.format(summary.monthlyIncome)}
              />
              <SummaryCard
                icon={ArrowUpCircle}
                label="Expense bulan ini"
                tone="negative"
                value={moneyFormatter.format(summary.monthlyExpense)}
              />
              <SummaryCard
                icon={ArrowRightLeft}
                label="Cashflow bulan ini"
                tone={summary.monthlyCashflow >= 0 ? 'positive' : 'negative'}
                value={moneyFormatter.format(summary.monthlyCashflow)}
              />
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BarChart3 className="size-5" />
                    Budget Aktif
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <DashboardLine label="Jumlah budget" value={String(summary.activeBudgetCount)} />
                  <DashboardLine label="Hampir habis" value={String(summary.budgetWarningCount)} />
                  <DashboardLine label="Over budget" value={String(summary.budgetOverCount)} valueClassName="text-destructive" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Target className="size-5" />
                    Goal Aktif
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <DashboardLine label="Jumlah goal" value={String(summary.activeGoalCount)} />
                  <DashboardLine label="Total target" value={moneyFormatter.format(summary.goalTargetTotal)} />
                  <DashboardLine label="Terkumpul" value={moneyFormatter.format(summary.goalCurrentTotal)} />
                  <DashboardLine label="Progress rata-rata" value={`${summary.goalAverageProgress}%`} />
                  <DashboardLine label="Pencapaian" value={String(summary.achievedGoalCount)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Landmark className="size-5" />
                    Debt Aktif
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <DashboardLine label="Jumlah hutang" value={String(summary.activeDebtCount)} />
                  <DashboardLine label="Total sisa" value={moneyFormatter.format(summary.debtRemainingTotal)} />
                  <div className="rounded-md border border-border p-3">
                    <p className="text-muted-foreground">Hutang terdekat</p>
                    {summary.nearestDebt ? (
                      <Link className="mt-1 block font-medium hover:text-primary" to={`/app/debts/${summary.nearestDebt.id}`}>
                        {summary.nearestDebt.name} - {dateFormatter.format(new Date(summary.nearestDebt.due_date ?? ''))}
                      </Link>
                    ) : (
                      <p className="mt-1 font-medium">-</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard icon={WalletCards} label="Wallet aktif" value={String(summary.activeWalletCount)} />
              <SummaryCard icon={BarChart3} label="Budget aktif" value={String(summary.activeBudgetCount)} />
              <SummaryCard icon={Target} label="Goal aktif" value={String(summary.activeGoalCount)} />
              <SummaryCard icon={Landmark} label="Hutang aktif" value={String(summary.activeDebtCount)} />
            </div>

            <RecentTransactions transactions={summary.recentTransactions} />
          </div>
        ) : null}
      </section>
    </main>
  );
}

function DashboardLine({
  label,
  value,
  valueClassName = ''
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${valueClassName}`}>{value}</span>
    </div>
  );
}
