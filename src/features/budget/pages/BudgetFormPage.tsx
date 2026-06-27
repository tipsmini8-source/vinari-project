import { ArrowLeft } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { BudgetForm } from '@features/budget/components/BudgetForm';
import { useBudget, useBudgetCategories, useCreateBudget, useUpdateBudget } from '@features/budget/hooks/useBudgets';
import type { BudgetFormInput } from '@features/budget/types/budget.types';
import { Button } from '@shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

export function BudgetFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const categoriesQuery = useBudgetCategories(workspace?.id);
  const budgetQuery = useBudget(id, workspace?.id);
  const createBudget = useCreateBudget(workspace?.id);
  const updateBudget = useUpdateBudget(workspace?.id);

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  if (isEdit && budgetQuery.isLoading) {
    return <GlobalLoading />;
  }

  const handleSubmit = async (input: BudgetFormInput) => {
    try {
      if (isEdit && id) {
        await updateBudget.mutateAsync({ budgetId: id, input });
        toast({ title: 'Budget diperbarui' });
      } else {
        await createBudget.mutateAsync(input);
        toast({ title: 'Budget dibuat' });
      }

      void navigate('/app/budgets');
    } catch (error) {
      toast({
        title: isEdit ? 'Gagal mengubah budget' : 'Gagal membuat budget',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  return (
    <main className="min-h-svh bg-background px-4 py-8 text-foreground">
      <section className="mx-auto w-full max-w-3xl">
        <Button asChild className="mb-4" size="sm" variant="ghost">
          <Link to="/app/budgets">
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? 'Edit Budget' : 'Tambah Budget'}</CardTitle>
            <CardDescription>
              Buat budget bulanan untuk kategori expense dan tentukan batas alert pemakaian.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetForm
              categories={categoriesQuery.data ?? []}
              defaultBudget={budgetQuery.data ?? null}
              isSubmitting={createBudget.isPending || updateBudget.isPending}
              onCancel={() => void navigate('/app/budgets')}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
