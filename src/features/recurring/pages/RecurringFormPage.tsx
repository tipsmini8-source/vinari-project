import { ArrowLeft } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { RecurringTransactionForm } from '@features/recurring/components/RecurringForms';
import { RecurringErrorState } from '@features/recurring/components/RecurringStates';
import {
  useCreateRecurringTransaction,
  useRecurringReferences,
  useRecurringTransaction,
  useUpdateRecurringTransaction
} from '@features/recurring/hooks/useRecurring';
import type { RecurringTransactionSubmitInput } from '@features/recurring/types/recurring.types';
import { Button } from '@shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

function canManageRecurring(role: string | undefined) {
  return role === 'owner' || role === 'partner' || role === 'member';
}

export function RecurringFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const recurringQuery = useRecurringTransaction(id, workspace?.id);
  const references = useRecurringReferences(workspace?.id);
  const createRecurring = useCreateRecurringTransaction(workspace?.id);
  const updateRecurring = useUpdateRecurringTransaction(workspace?.id);

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  if (!canManageRecurring(workspace.role)) {
    return <Navigate replace to="/app/recurring" />;
  }

  if ((isEdit && recurringQuery.isLoading) || references.isLoading) {
    return <GlobalLoading />;
  }

  const handleSubmit = async (input: RecurringTransactionSubmitInput) => {
    try {
      if (isEdit && id) {
        await updateRecurring.mutateAsync({ recurringId: id, input });
        toast({ title: 'Transaksi berulang diperbarui' });
      } else {
        await createRecurring.mutateAsync(input);
        toast({ title: 'Transaksi berulang dibuat' });
      }

      void navigate('/app/recurring');
    } catch (error) {
      toast({
        title: isEdit ? 'Gagal mengubah transaksi berulang' : 'Gagal membuat transaksi berulang',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  return (
    <main className="min-h-svh bg-background px-4 py-8 text-foreground">
      <section className="mx-auto w-full max-w-3xl">
        <Button asChild className="mb-4" size="sm" variant="ghost">
          <Link to="/app/recurring">
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>

        {(isEdit && recurringQuery.isError) || references.isError ? (
          <RecurringErrorState
            message={
              recurringQuery.error instanceof Error
                ? recurringQuery.error.message
                : references.error instanceof Error
                  ? references.error.message
                  : 'Terjadi kesalahan.'
            }
            onRetry={() => {
              void recurringQuery.refetch();
              void references.wallets.refetch();
              void references.categories.refetch();
            }}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{isEdit ? 'Edit Transaksi Berulang' : 'Tambah Transaksi Berulang'}</CardTitle>
              <CardDescription>
                Catat pemasukan atau pengeluaran rutin. Vinari belum membuat catatan otomatis untuk jadwal ini.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecurringTransactionForm
                categories={references.categories.data ?? []}
                defaultRecurring={recurringQuery.data ?? null}
                isSubmitting={createRecurring.isPending || updateRecurring.isPending}
                onCancel={() => void navigate('/app/recurring')}
                onSubmit={handleSubmit}
                wallets={references.wallets.data ?? []}
              />
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}
