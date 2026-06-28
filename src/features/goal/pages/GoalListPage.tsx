import { Coins, Plus, Target, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { GoalContributionForm } from '@features/goal/components/GoalContributionForm';
import { GoalList } from '@features/goal/components/GoalList';
import { GoalEmptyState, GoalErrorState, GoalSkeleton } from '@features/goal/components/GoalStates';
import { useAddGoalContribution, useDeleteGoal, useGoalWallets, useGoals } from '@features/goal/hooks/useGoals';
import type { GoalContributionFormInput, GoalWithProgress } from '@features/goal/types/goal.types';
import { ActionDialog } from '@shared/components/ActionDialog';
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
  getGoalDisplayStatus,
  statusFilterOptions,
  type StatusFilterValue
} from '@shared/utils/statusFilters';

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  style: 'currency',
  maximumFractionDigits: 0
});

function canManagePlanning(role: string | undefined) {
  return role === 'owner' || role === 'partner' || role === 'member';
}

export function GoalListPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('active');
  const [contributionGoal, setContributionGoal] = useState<GoalWithProgress | null>(null);
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const goalsQuery = useGoals(workspace?.id);
  const deleteGoal = useDeleteGoal(workspace?.id);
  const addContribution = useAddGoalContribution(workspace?.id);
  const walletsQuery = useGoalWallets(workspace?.id);
  const canManage = canManagePlanning(workspace?.role);
  const goals = useMemo(() => goalsQuery.data ?? [], [goalsQuery.data]);
  const filteredGoals = useMemo(
    () => filterByStatus(goals, statusFilter, getGoalDisplayStatus),
    [goals, statusFilter]
  );
  const activeGoals = useMemo(() => filterByStatus(goals, 'active', getGoalDisplayStatus), [goals]);
  const targetTotal = activeGoals.reduce((total, goal) => total + goal.target_amount, 0);
  const collectedTotal = activeGoals.reduce((total, goal) => total + goal.current_amount, 0);
  const remainingTotal = Math.max(targetTotal - collectedTotal, 0);

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

  const handleContribution = async (input: GoalContributionFormInput) => {
    if (!contributionGoal) {
      return;
    }

    try {
      await addContribution.mutateAsync({ goalId: contributionGoal.id, input });
      setContributionGoal(null);
      toast({ title: 'Tabungan target ditambahkan' });
    } catch (error) {
      toast({
        title: 'Gagal menambah tabungan',
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
              <Link to="/app/goals/new">
                <Plus className="size-4" />
                Tambah Target
              </Link>
            </Button>
          }
          description="Kelola target keuangan dan pantau kontribusi tabungan."
          eyebrow={workspace.name}
          title="Target Tabungan"
        />

        <div className="mb-4">
          <SectionStatusTabs options={statusFilterOptions} value={statusFilter} onChange={setStatusFilter} />
        </div>

        <div className="mb-5">
          <ModuleSummaryCard
            stats={[
              { icon: Target, label: 'Target Aktif', value: moneyFormatter.format(targetTotal) },
              { icon: WalletCards, label: 'Terkumpul', tone: 'good', value: moneyFormatter.format(collectedTotal) },
              { icon: Coins, label: 'Masih Kurang', tone: 'default', value: moneyFormatter.format(remainingTotal) }
            ]}
          />
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
          <GoalList
            goals={filteredGoals}
            onAddContribution={canManage ? setContributionGoal : undefined}
            onDelete={handleDelete}
          />
        ) : null}

        {!goalsQuery.isLoading && !goalsQuery.isError ? (
          <ModuleInfoTip>
            Target tabungan membantu memantau tujuan uang tanpa mengubah saldo asli sampai Anda mencatat kontribusi.
          </ModuleInfoTip>
        ) : null}

        <ActionDialog
          description="Tambahkan progres tabungan target. Ini tidak mengurangi saldo dompet secara otomatis."
          onClose={() => setContributionGoal(null)}
          open={Boolean(contributionGoal)}
          title={contributionGoal ? `Tambah Tabungan ${contributionGoal.name}` : 'Tambah Tabungan'}
        >
          {contributionGoal ? (
            <GoalContributionForm
              defaultAmount={Math.max(contributionGoal.remaining_amount, 0)}
              defaultWalletId={contributionGoal.wallet_id ?? walletsQuery.data?.[0]?.id ?? ''}
              isSubmitting={addContribution.isPending}
              onSubmit={handleContribution}
              submitLabel="Tambah Tabungan"
              wallets={walletsQuery.data ?? []}
            />
          ) : null}
        </ActionDialog>
      </section>
    </main>
  );
}
