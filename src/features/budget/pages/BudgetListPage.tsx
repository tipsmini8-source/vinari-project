import { ChartNoAxesCombined, Coins, Plus, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { BudgetList } from '@features/budget/components/BudgetList';
import { BudgetEmptyState, BudgetErrorState, BudgetSkeleton } from '@features/budget/components/BudgetStates';
import { useBudgets, useDeleteBudget } from '@features/budget/hooks/useBudgets';
import type { BudgetWithProgress } from '@features/budget/types/budget.types';
import { ModuleInfoTip } from '@shared/components/ModuleInfoTip';
import { ModuleSummaryCard } from '@shared/components/ModuleSummaryCard';
import { SectionHeaderAction } from '@shared/components/SectionHeaderAction';
import { SectionStatusTabs } from '@shared/components/SectionStatusTabs';
import { StatusFilterEmptyState } from '@shared/components/StatusFilterEmptyState';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';
import {
  filterByStatus,
  getBudgetDisplayStatus,
  statusFilterOptions,
  type StatusFilterValue
} from '@shared/utils/statusFilters';

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  style: 'currency',
  maximumFractionDigits: 0
});

export function BudgetListPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('active');
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const budgetsQuery = useBudgets(workspace?.id);
  const deleteBudget = useDeleteBudget(workspace?.id);
  const budgets = useMemo(() => budgetsQuery.data ?? [], [budgetsQuery.data]);
  const filteredBudgets = useMemo(
    () => filterByStatus(budgets, statusFilter, getBudgetDisplayStatus),
    [budgets, statusFilter]
  );
  const activeBudgets = useMemo(
    () => filterByStatus(budgets, 'active', getBudgetDisplayStatus),
    [budgets]
  );
  const totalBudget = activeBudgets.reduce((total, budget) => total + budget.amount, 0);
  const totalSpent = activeBudgets.reduce((total, budget) => total + budget.spent_amount, 0);
  const totalRemaining = totalBudget - totalSpent;

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  const handleDelete = async (budget: BudgetWithProgress) => {
    const confirmed = window.confirm(`Hapus batas pengeluaran "${budget.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteBudget.mutateAsync(budget.id);
      toast({ title: 'Batas pengeluaran dihapus' });
    } catch (error) {
      toast({
        title: 'Gagal menghapus batas pengeluaran',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  return (
    <main className="min-h-svh bg-background px-4 pb-28 pt-6 text-foreground sm:py-8">
      <section className="mx-auto w-full max-w-6xl">
        <SectionHeaderAction
          action={
            <Button asChild className="w-full rounded-full sm:w-auto">
              <Link to="/app/budgets/new">
                <Plus className="size-4" />
                Tambah Batas
              </Link>
            </Button>
          }
          description="Pantau batas bulanan untuk uang keluar dan sisa penggunaannya."
          eyebrow={workspace.name}
          title="Batas Pengeluaran"
        />

        <div className="mb-4">
          <SectionStatusTabs options={statusFilterOptions} value={statusFilter} onChange={setStatusFilter} />
        </div>

        <div className="mb-5">
          <ModuleSummaryCard
            stats={[
              { icon: WalletCards, label: 'Total Batas', value: moneyFormatter.format(totalBudget) },
              { icon: ChartNoAxesCombined, label: 'Terpakai', tone: 'warn', value: moneyFormatter.format(totalSpent) },
              {
                icon: Coins,
                label: 'Sisa Bulan Ini',
                tone: totalRemaining < 0 ? 'bad' : 'good',
                value:
                  totalRemaining < 0
                    ? `Kurang ${moneyFormatter.format(Math.abs(totalRemaining))}`
                    : moneyFormatter.format(totalRemaining)
              }
            ]}
          />
        </div>

        {budgetsQuery.isLoading ? <BudgetSkeleton /> : null}

        {budgetsQuery.isError ? (
          <BudgetErrorState
            message={budgetsQuery.error instanceof Error ? budgetsQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void budgetsQuery.refetch()}
          />
        ) : null}

        {!budgetsQuery.isLoading && !budgetsQuery.isError && budgets.length === 0 ? (
          <BudgetEmptyState />
        ) : null}

        {!budgetsQuery.isLoading && !budgetsQuery.isError && budgets.length > 0 && filteredBudgets.length === 0 ? (
          <StatusFilterEmptyState
            createHref="/app/budgets/new"
            ctaLabel="Tambah Batas"
            description="Coba pilih status lain atau buat batas pengeluaran baru."
            filter={statusFilter}
          />
        ) : null}

        {!budgetsQuery.isLoading && !budgetsQuery.isError && filteredBudgets.length > 0 ? (
          <BudgetList budgets={filteredBudgets} onDelete={handleDelete} />
        ) : null}

        {!budgetsQuery.isLoading && !budgetsQuery.isError ? (
          <ModuleInfoTip>
            Batas membantu menjaga uang keluar tetap terkendali. Transfer antar dompet tidak dihitung sebagai pengeluaran.
          </ModuleInfoTip>
        ) : null}
      </section>
    </main>
  );
}
