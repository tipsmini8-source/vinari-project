import { ArrowLeft, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { TransactionFilters } from '@features/transaction/components/TransactionFilters';
import { TransactionList } from '@features/transaction/components/TransactionList';
import {
  TransactionEmptyState,
  TransactionErrorState,
  TransactionSkeleton
} from '@features/transaction/components/TransactionStates';
import {
  useDeleteTransaction,
  useTransactionReferences,
  useTransactions
} from '@features/transaction/hooks/useTransactions';
import type { Transaction, TransactionFilterInput } from '@features/transaction/types/transaction.types';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

const defaultFilters: TransactionFilterInput = {
  dateFrom: '',
  dateTo: '',
  type: 'all',
  walletId: '',
  categoryId: ''
};

export function TransactionListPage() {
  const [filters, setFilters] = useState<TransactionFilterInput>(defaultFilters);
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const references = useTransactionReferences(workspace?.id);
  const transactionsQuery = useTransactions(workspace?.id, filters);
  const deleteTransaction = useDeleteTransaction(workspace?.id);

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  const handleDelete = async (transaction: Transaction) => {
    const confirmed = window.confirm(`Hapus transaksi "${transaction.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteTransaction.mutateAsync(transaction.id);
      toast({ title: 'Transaksi dihapus' });
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
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Transaksi</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Catat dan telusuri pemasukan, pengeluaran, dan transfer antar wallet.
            </p>
          </div>
          <Button asChild>
            <Link to="/app/transactions/new">
              <Plus className="size-4" />
              Tambah Transaksi
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          <TransactionFilters
            categories={references.categories.data ?? []}
            filters={filters}
            onChange={setFilters}
            wallets={references.wallets.data ?? []}
          />

          {transactionsQuery.isLoading || references.isLoading ? <TransactionSkeleton /> : null}

          {transactionsQuery.isError ? (
            <TransactionErrorState
              message={
                transactionsQuery.error instanceof Error ? transactionsQuery.error.message : 'Terjadi kesalahan.'
              }
              onRetry={() => void transactionsQuery.refetch()}
            />
          ) : null}

          {!transactionsQuery.isLoading &&
          !transactionsQuery.isError &&
          (transactionsQuery.data ?? []).length === 0 ? (
            <TransactionEmptyState />
          ) : null}

          {!transactionsQuery.isLoading &&
          !transactionsQuery.isError &&
          (transactionsQuery.data ?? []).length > 0 ? (
            <TransactionList onDelete={handleDelete} transactions={transactionsQuery.data ?? []} />
          ) : null}
        </div>
      </section>
    </main>
  );
}
