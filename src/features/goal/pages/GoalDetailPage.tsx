import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { GoalContributionForm } from '@features/goal/components/GoalContributionForm';
import { GoalContributionHistory } from '@features/goal/components/GoalContributionHistory';
import { GoalProgress } from '@features/goal/components/GoalProgress';
import { GoalErrorState, GoalSkeleton } from '@features/goal/components/GoalStates';
import {
  useAddGoalContribution,
  useDeleteGoal,
  useGoal,
  useGoalContributions,
  useGoalWallets
} from '@features/goal/hooks/useGoals';
import type { GoalContributionFormInput } from '@features/goal/types/goal.types';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  style: 'currency',
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium'
});

export function GoalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const goalQuery = useGoal(id, workspace?.id);
  const contributionsQuery = useGoalContributions(id, workspace?.id);
  const walletsQuery = useGoalWallets(workspace?.id);
  const addContribution = useAddGoalContribution(workspace?.id);
  const deleteGoal = useDeleteGoal(workspace?.id);

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  if (!id) {
    return <Navigate replace to="/app/goals" />;
  }

  const goal = goalQuery.data;

  const handleContributionSubmit = async (input: GoalContributionFormInput) => {
    try {
      await addContribution.mutateAsync({ goalId: id, input });
      toast({ title: 'Kontribusi ditambahkan' });
    } catch (error) {
      toast({
        title: 'Gagal menambah kontribusi',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async () => {
    if (!goal) {
      return;
    }

    const confirmed = window.confirm(`Hapus goal "${goal.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteGoal.mutateAsync(goal.id);
      toast({ title: 'Goal dihapus' });
      void navigate('/app/goals');
    } catch (error) {
      toast({
        title: 'Gagal menghapus goal',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  return (
    <main className="min-h-svh bg-background px-4 py-8 text-foreground">
      <section className="mx-auto w-full max-w-6xl">
        <Button asChild className="mb-4" size="sm" variant="ghost">
          <Link to="/app/goals">
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>

        {goalQuery.isLoading ? <GoalSkeleton /> : null}

        {goalQuery.isError ? (
          <GoalErrorState
            message={goalQuery.error instanceof Error ? goalQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void goalQuery.refetch()}
          />
        ) : null}

        {goal ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary">{workspace.name}</p>
                      <CardTitle className="mt-1">{goal.name}</CardTitle>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {goal.target_date ? dateFormatter.format(new Date(goal.target_date)) : 'Tanpa target date'}
                        {goal.wallet_name ? ` - ${goal.wallet_name}` : ''}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button asChild aria-label="Edit goal" size="icon" variant="ghost">
                        <Link to={`/app/goals/${goal.id}/edit`}>
                          <Edit className="size-4" />
                        </Link>
                      </Button>
                      <Button aria-label="Hapus goal" onClick={handleDelete} size="icon" type="button" variant="ghost">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <GoalProgress percentage={goal.percentage} status={goal.status} />
                  <div className="grid gap-3 text-sm sm:grid-cols-4">
                    <div>
                      <p className="text-muted-foreground">Target amount</p>
                      <p className="font-medium">{moneyFormatter.format(goal.target_amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Current amount</p>
                      <p className="font-medium">{moneyFormatter.format(goal.current_amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sisa target</p>
                      <p className={cn('font-medium', goal.remaining_amount <= 0 ? 'text-primary' : '')}>
                        {moneyFormatter.format(goal.remaining_amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Progress</p>
                      <p className="font-medium">{goal.percentage}%</p>
                    </div>
                  </div>
                  <div className="rounded-md border border-border p-3 text-sm">
                    <p className="text-muted-foreground">Status</p>
                    <p className="mt-1 font-medium capitalize">{goal.status}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Contribution History</CardTitle>
                </CardHeader>
                <CardContent>
                  {contributionsQuery.isLoading ? <GoalSkeleton /> : null}
                  {!contributionsQuery.isLoading ? (
                    <GoalContributionHistory contributions={contributionsQuery.data ?? []} />
                  ) : null}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Tambah Kontribusi</CardTitle>
              </CardHeader>
              <CardContent>
                <GoalContributionForm
                  isSubmitting={addContribution.isPending}
                  onSubmit={handleContributionSubmit}
                  wallets={walletsQuery.data ?? []}
                />
              </CardContent>
            </Card>
          </div>
        ) : null}
      </section>
    </main>
  );
}
