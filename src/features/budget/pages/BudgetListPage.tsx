import { ArrowLeft, Plus } from 'lucide-react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { BudgetList } from '@features/budget/components/BudgetList';
import { BudgetEmptyState, BudgetErrorState, BudgetSkeleton } from '@features/budget/components/BudgetStates';
import { useBudgets, useDeleteBudget } from '@features/budget/hooks/useBudgets';
import type { BudgetWithProgress } from '@features/budget/types/budget.types';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

export function BudgetListPage() {
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const budgetsQuery = useBudgets(workspace?.id);
  const deleteBudget = useDeleteBudget(workspace?.id);

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  const handleDelete = async (budget: BudgetWithProgress) => {
    const confirmed = window.confirm(`Hapus budget "${budget.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteBudget.mutateAsync(budget.id);
      toast({ title: 'Budget dihapus' });
    } catch (error) {
      toast({
        title: 'Gagal menghapus budget',
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
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Budget</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Pantau budget bulanan per kategori expense dan sisa penggunaannya.
            </p>
          </div>
          <Button asChild>
            <Link to="/app/budgets/new">
              <Plus className="size-4" />
              Tambah Budget
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

        {!budgetsQuery.isLoading && !budgetsQuery.isError && (budgetsQuery.data ?? []).length === 0 ? (
          <BudgetEmptyState />
        ) : null}

        {!budgetsQuery.isLoading && !budgetsQuery.isError && (budgetsQuery.data ?? []).length > 0 ? (
          <BudgetList budgets={budgetsQuery.data ?? []} onDelete={handleDelete} />
        ) : null}
      </section>
    </main>
  );
}
