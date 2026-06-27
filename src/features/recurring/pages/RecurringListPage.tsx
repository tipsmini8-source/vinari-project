import { ArrowLeft, Plus } from 'lucide-react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { RecurringTransactionList } from '@features/recurring/components/RecurringLists';
import { RecurringEmptyState, RecurringErrorState, RecurringSkeleton } from '@features/recurring/components/RecurringStates';
import {
  useDeactivateRecurringTransaction,
  useDeleteRecurringTransaction,
  useRecurringTransactions
} from '@features/recurring/hooks/useRecurring';
import { formatRecurringDate } from '@features/recurring/services/recurring-formatters';
import type { RecurringTransaction } from '@features/recurring/types/recurring.types';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

function canManageRecurring(role: string | undefined) {
  return role === 'owner' || role === 'partner' || role === 'member';
}

export function RecurringListPage() {
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const recurringQuery = useRecurringTransactions(workspace?.id);
  const deactivateRecurring = useDeactivateRecurringTransaction(workspace?.id);
  const deleteRecurring = useDeleteRecurringTransaction(workspace?.id);
  const canManage = canManageRecurring(workspace?.role);

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  const activeItems = (recurringQuery.data ?? []).filter((item) => item.is_active);
  const nearestRun = activeItems[0] ?? null;

  const handleDeactivate = async (item: RecurringTransaction) => {
    const confirmed = window.confirm(`Nonaktifkan transaksi berulang "${item.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deactivateRecurring.mutateAsync(item.id);
      toast({ title: 'Transaksi berulang dinonaktifkan' });
    } catch (error) {
      toast({
        title: 'Gagal menonaktifkan transaksi berulang',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (item: RecurringTransaction) => {
    const confirmed = window.confirm(`Hapus transaksi berulang "${item.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteRecurring.mutateAsync(item.id);
      toast({ title: 'Transaksi berulang dihapus' });
    } catch (error) {
      toast({
        title: 'Gagal menghapus transaksi berulang',
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
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Recurring Transactions</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Catat transaksi income atau expense yang berulang tanpa auto-execute.
            </p>
          </div>
          {canManage ? (
            <Button asChild>
              <Link to="/app/recurring/new">
                <Plus className="size-4" />
                Tambah Recurring
              </Link>
            </Button>
          ) : null}
        </div>

        {nearestRun ? (
          <div className="mb-4 rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm">
            <p className="text-sm text-muted-foreground">Next run terdekat</p>
            <p className="mt-1 font-semibold">
              {nearestRun.title} - {formatRecurringDate(nearestRun.next_run_date)}
            </p>
          </div>
        ) : null}

        {recurringQuery.isLoading ? <RecurringSkeleton /> : null}

        {recurringQuery.isError ? (
          <RecurringErrorState
            message={recurringQuery.error instanceof Error ? recurringQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void recurringQuery.refetch()}
          />
        ) : null}

        {!recurringQuery.isLoading && !recurringQuery.isError && (recurringQuery.data ?? []).length === 0 ? (
          <RecurringEmptyState
            canCreate={canManage}
            createHref="/app/recurring/new"
            ctaLabel="Tambah Recurring"
            description="Buat catatan transaksi rutin seperti gaji, iuran, atau pengeluaran bulanan."
            title="Belum ada transaksi berulang"
          />
        ) : null}

        {!recurringQuery.isLoading && !recurringQuery.isError && (recurringQuery.data ?? []).length > 0 ? (
          <RecurringTransactionList
            canManage={canManage}
            items={recurringQuery.data ?? []}
            onDeactivate={handleDeactivate}
            onDelete={handleDelete}
          />
        ) : null}
      </section>
    </main>
  );
}
