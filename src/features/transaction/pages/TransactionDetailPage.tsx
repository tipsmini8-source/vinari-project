import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { useDeleteTransaction, useTransaction } from '@features/transaction/hooks/useTransactions';
import { Button } from '@shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  style: 'currency',
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'full'
});

export function TransactionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const transactionQuery = useTransaction(id);
  const deleteTransaction = useDeleteTransaction(workspace?.id);

  if (loading || transactionQuery.isLoading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  if (!transactionQuery.data) {
    return <Navigate replace to="/app/transactions" />;
  }

  const transaction = transactionQuery.data;

  const handleDelete = async () => {
    const confirmed = window.confirm(`Hapus transaksi "${transaction.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteTransaction.mutateAsync(transaction.id);
      toast({ title: 'Transaksi dihapus' });
      void navigate('/app/transactions', { replace: true });
    } catch (error) {
      toast({
        title: 'Gagal menghapus transaksi',
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>{transaction.title}</CardTitle>
                <CardDescription>
                  {dateFormatter.format(new Date(transaction.transaction_date))} - {transaction.type}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to={`/app/transactions/${transaction.id}/edit`}>
                    <Edit className="size-4" />
                    Edit
                  </Link>
                </Button>
                <Button onClick={handleDelete} size="sm" type="button" variant="outline">
                  <Trash2 className="size-4" />
                  Hapus
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border p-4">
                <dt className="text-sm text-muted-foreground">Amount</dt>
                <dd className="mt-1 text-2xl font-semibold">{moneyFormatter.format(transaction.amount)}</dd>
              </div>
              <div className="rounded-md border border-border p-4">
                <dt className="text-sm text-muted-foreground">Wallet</dt>
                <dd className="mt-1 font-semibold">
                  {transaction.type === 'transfer'
                    ? `${transaction.wallet_name ?? '-'} ke ${transaction.destination_wallet_name ?? '-'}`
                    : transaction.wallet_name ?? '-'}
                </dd>
              </div>
              <div className="rounded-md border border-border p-4">
                <dt className="text-sm text-muted-foreground">Kategori</dt>
                <dd className="mt-1 font-semibold">{transaction.category_name ?? '-'}</dd>
              </div>
              <div className="rounded-md border border-border p-4">
                <dt className="text-sm text-muted-foreground">Financial effect</dt>
                <dd className="mt-1 font-semibold">{transaction.financial_effect}</dd>
              </div>
            </dl>
            {transaction.note ? (
              <div className="mt-3 rounded-md border border-border p-4">
                <p className="text-sm text-muted-foreground">Catatan</p>
                <p className="mt-1">{transaction.note}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
