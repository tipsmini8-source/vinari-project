import { ArrowLeft, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { GoalList } from '@features/goal/components/GoalList';
import { GoalEmptyState, GoalErrorState, GoalSkeleton } from '@features/goal/components/GoalStates';
import { useDeleteGoal, useGoals } from '@features/goal/hooks/useGoals';
import type { GoalWithProgress } from '@features/goal/types/goal.types';
import { SectionStatusTabs } from '@shared/components/SectionStatusTabs';
import { StatusFilterEmptyState } from '@shared/components/StatusFilterEmptyState';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';
import {
  filterByStatus,
  getGoalDisplayStatus,
  statusFilterOptions,
  type StatusFilterValue
} from '@shared/utils/statusFilters';

export function GoalListPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('active');
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const goalsQuery = useGoals(workspace?.id);
  const deleteGoal = useDeleteGoal(workspace?.id);
  const goals = useMemo(() => goalsQuery.data ?? [], [goalsQuery.data]);
  const filteredGoals = useMemo(
    () => filterByStatus(goals, statusFilter, getGoalDisplayStatus),
    [goals, statusFilter]
  );

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  const handleDelete = async (goal: GoalWithProgress) => {
    const confirmed = window.confirm(`Hapus target tabungan "${goal.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteGoal.mutateAsync(goal.id);
      toast({ title: 'Target tabungan dihapus' });
    } catch (error) {
      toast({
        title: 'Gagal menghapus target tabungan',
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
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Target Tabungan</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Kelola target keuangan dan pantau kontribusi tabungan.
            </p>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SectionStatusTabs options={statusFilterOptions} value={statusFilter} onChange={setStatusFilter} />
          <Button asChild className="w-full rounded-full sm:w-auto">
            <Link to="/app/goals/new">
              <Plus className="size-4" />
              Tambah Target
            </Link>
          </Button>
        </div>

        {goalsQuery.isLoading ? <GoalSkeleton /> : null}

        {goalsQuery.isError ? (
          <GoalErrorState
            message={goalsQuery.error instanceof Error ? goalsQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void goalsQuery.refetch()}
          />
        ) : null}

        {!goalsQuery.isLoading && !goalsQuery.isError && goals.length === 0 ? (
          <GoalEmptyState />
        ) : null}

        {!goalsQuery.isLoading && !goalsQuery.isError && goals.length > 0 && filteredGoals.length === 0 ? (
          <StatusFilterEmptyState
            createHref="/app/goals/new"
            ctaLabel="Tambah Target"
            description="Coba pilih status lain atau buat target tabungan baru."
            filter={statusFilter}
          />
        ) : null}

        {!goalsQuery.isLoading && !goalsQuery.isError && filteredGoals.length > 0 ? (
          <GoalList goals={filteredGoals} onDelete={handleDelete} />
        ) : null}
      </section>
    </main>
  );
}
