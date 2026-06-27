import { ArrowLeft } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { TransactionForm } from '@features/transaction/components/TransactionForm';
import {
  useCreateTransaction,
  useTransaction,
  useTransactionReferences,
  useUpdateTransaction
} from '@features/transaction/hooks/useTransactions';
import type { TransactionFormInput } from '@features/transaction/types/transaction.types';
import { Button } from '@shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

export function TransactionFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const references = useTransactionReferences(workspace?.id);
  const transactionQuery = useTransaction(id);
  const createTransaction = useCreateTransaction(workspace?.id);
  const updateTransaction = useUpdateTransaction(workspace?.id);

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  if (isEdit && transactionQuery.isLoading) {
    return <GlobalLoading />;
  }

  const handleSubmit = async (input: TransactionFormInput) => {
    try {
      if (isEdit && id) {
        await updateTransaction.mutateAsync({ transactionId: id, input });
        toast({ title: 'Transaksi diperbarui' });
      } else {
        await createTransaction.mutateAsync(input);
        toast({ title: 'Transaksi dibuat' });
      }

      void navigate('/app/transactions');
    } catch (error) {
      toast({
        title: isEdit ? 'Gagal mengubah transaksi' : 'Gagal membuat transaksi',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  return (
    <main className="min-h-svh bg-background px-4 py-8 text-foreground">
      <section className="mx-auto w-full max-w-3xl">
        <Button asChild className="mb-4" size="sm" variant="ghost">
          <Link to="/app/transactions">
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? 'Edit Transaksi' : 'Tambah Transaksi'}</CardTitle>
            <CardDescription>
              Isi transaksi sesuai aturan wallet, kategori, dan tipe transaksi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionForm
              categories={references.categories.data ?? []}
              defaultTransaction={transactionQuery.data ?? null}
              isSubmitting={createTransaction.isPending || updateTransaction.isPending}
              onCancel={() => void navigate('/app/transactions')}
              onSubmit={handleSubmit}
              wallets={references.wallets.data ?? []}
            />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
