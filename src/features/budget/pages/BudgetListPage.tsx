import { ArrowLeft, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { BudgetList } from '@features/budget/components/BudgetList';
import { BudgetEmptyState, BudgetErrorState, BudgetSkeleton } from '@features/budget/components/BudgetStates';
import { useBudgets, useDeleteBudget } from '@features/budget/hooks/useBudgets';
import type { BudgetWithProgress } from '@features/budget/types/budget.types';
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
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Batas Pengeluaran</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Pantau batas bulanan untuk uang keluar dan sisa penggunaannya.
            </p>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SectionStatusTabs options={statusFilterOptions} value={statusFilter} onChange={setStatusFilter} />
          <Button asChild className="w-full rounded-full sm:w-auto">
            <Link to="/app/budgets/new">
              <Plus className="size-4" />
              Tambah Batas
            </Link>
          </Button>
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
      </section>
    </main>
  );
}
