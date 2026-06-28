import { ArrowLeft } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { GoalForm } from '@features/goal/components/GoalForm';
import { useCreateGoal, useGoal, useGoalWallets, useUpdateGoal } from '@features/goal/hooks/useGoals';
import type { GoalFormInput } from '@features/goal/types/goal.types';
import { Button } from '@shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

export function GoalFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const walletsQuery = useGoalWallets(workspace?.id);
  const goalQuery = useGoal(id, workspace?.id);
  const createGoal = useCreateGoal(workspace?.id);
  const updateGoal = useUpdateGoal(workspace?.id);

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  if (isEdit && goalQuery.isLoading) {
    return <GlobalLoading />;
  }

  const handleSubmit = async (input: GoalFormInput) => {
    try {
      if (isEdit && id) {
        await updateGoal.mutateAsync({ goalId: id, input });
        toast({ title: 'Target tabungan diperbarui' });
      } else {
        await createGoal.mutateAsync(input);
        toast({ title: 'Target tabungan dibuat' });
      }

      void navigate('/app/goals');
    } catch (error) {
      toast({
        title: isEdit ? 'Gagal mengubah target tabungan' : 'Gagal membuat target tabungan',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  return (
    <main className="min-h-svh bg-background px-4 py-8 text-foreground">
      <section className="mx-auto w-full max-w-3xl">
        <Button asChild className="mb-4" size="sm" variant="ghost">
          <Link to="/app/goals">
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? 'Edit Target Tabungan' : 'Tambah Target Tabungan'}</CardTitle>
            <CardDescription>
              Buat target keuangan, pilih dompet tabungan, dan isi nominal awal jika sudah ada saldo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GoalForm
              defaultGoal={goalQuery.data ?? null}
              isSubmitting={createGoal.isPending || updateGoal.isPending}
              onCancel={() => void navigate('/app/goals')}
              onSubmit={handleSubmit}
              wallets={walletsQuery.data ?? []}
            />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
