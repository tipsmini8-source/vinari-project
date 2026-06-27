import { ArrowDownCircle, ArrowRightLeft, ArrowUpCircle, Plus, WalletCards } from 'lucide-react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { DashboardErrorState, DashboardSkeleton } from '@features/dashboard/components/DashboardStates';
import { RecentTransactions } from '@features/dashboard/components/RecentTransactions';
import { SummaryCard } from '@features/dashboard/components/SummaryCard';
import { useDashboardSummary } from '@features/dashboard/hooks/useDashboard';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  style: 'currency',
  maximumFractionDigits: 0
});

export function DashboardPage() {
  const { loading, workspace } = useWorkspace();
  const dashboardQuery = useDashboardSummary(workspace?.id);

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
              Ringkasan keuangan berdasarkan wallet dan transaksi workspace aktif.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link to="/app/transactions/new">
                <Plus className="size-4" />
                Tambah Income
              </Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link to="/app/transactions/new">Tambah Expense</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/app/transactions/new">Tambah Transfer</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/app/wallets">Kelola Wallet</Link>
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

        {dashboardQuery.data ? (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <SummaryCard
                icon={WalletCards}
                label="Total saldo wallet"
                value={moneyFormatter.format(dashboardQuery.data.totalWalletBalance)}
              />
              <SummaryCard
                icon={ArrowDownCircle}
                label="Income bulan ini"
                tone="positive"
                value={moneyFormatter.format(dashboardQuery.data.monthlyIncome)}
              />
              <SummaryCard
                icon={ArrowUpCircle}
                label="Expense bulan ini"
                tone="negative"
                value={moneyFormatter.format(dashboardQuery.data.monthlyExpense)}
              />
              <SummaryCard
                icon={ArrowRightLeft}
                label="Cashflow bulan ini"
                tone={dashboardQuery.data.monthlyCashflow >= 0 ? 'positive' : 'negative'}
                value={moneyFormatter.format(dashboardQuery.data.monthlyCashflow)}
              />
              <SummaryCard
                icon={WalletCards}
                label="Wallet aktif"
                value={String(dashboardQuery.data.activeWalletCount)}
              />
            </div>

            <RecentTransactions transactions={dashboardQuery.data.recentTransactions} />
          </div>
        ) : null}
      </section>
    </main>
  );
}
