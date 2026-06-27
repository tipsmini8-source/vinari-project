import { ArrowLeft } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { DebtForm } from '@features/debt/components/DebtForm';
import { useCreateDebt, useDebt, useUpdateDebt } from '@features/debt/hooks/useDebts';
import type { DebtFormInput } from '@features/debt/types/debt.types';
import { Button } from '@shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

export function DebtFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const debtQuery = useDebt(id, workspace?.id);
  const createDebt = useCreateDebt(workspace?.id);
  const updateDebt = useUpdateDebt(workspace?.id);

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  if (isEdit && debtQuery.isLoading) {
    return <GlobalLoading />;
  }

  const handleSubmit = async (input: DebtFormInput) => {
    try {
      if (isEdit && id) {
        await updateDebt.mutateAsync({ debtId: id, input });
        toast({ title: 'Hutang diperbarui' });
      } else {
        await createDebt.mutateAsync(input);
        toast({ title: 'Hutang dibuat' });
      }

      void navigate('/app/debts');
    } catch (error) {
      toast({
        title: isEdit ? 'Gagal mengubah hutang' : 'Gagal membuat hutang',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  return (
    <main className="min-h-svh bg-background px-4 py-8 text-foreground">
      <section className="mx-auto w-full max-w-3xl">
        <Button asChild className="mb-4" size="sm" variant="ghost">
          <Link to="/app/debts">
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? 'Edit Hutang' : 'Tambah Hutang'}</CardTitle>
            <CardDescription>
              Catat principal, cicilan, bunga, jatuh tempo, dan detail pemberi hutang.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DebtForm
              defaultDebt={debtQuery.data ?? null}
              isSubmitting={createDebt.isPending || updateDebt.isPending}
              onCancel={() => void navigate('/app/debts')}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
