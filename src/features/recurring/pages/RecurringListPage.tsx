import { ArrowLeft, Plus } from 'lucide-react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { RecurringTransactionList } from '@features/recurring/components/RecurringLists';
import { RecurringEmptyState, RecurringErrorState, RecurringSkeleton } from '@features/recurring/components/RecurringStates';
import {
  useDeactivateRecurringTransaction,
  useDeleteRecurringTransaction,
  useRecurringTransactions,
  useUpdateRecurringTransaction
} from '@features/recurring/hooks/useRecurring';
import { formatRecurringDate } from '@features/recurring/services/recurring-formatters';
import type { RecurringTransaction, ScheduleCycle } from '@features/recurring/types/recurring.types';
import { useCreateTransaction } from '@features/transaction/hooks/useTransactions';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

function canManageRecurring(role: string | undefined) {
  return role === 'owner' || role === 'partner' || role === 'member';
}

function advanceDate(date: string, cycle: ScheduleCycle) {
  const nextDate = new Date(date);

  if (cycle === 'daily') {
    nextDate.setDate(nextDate.getDate() + 1);
  } else if (cycle === 'weekly') {
    nextDate.setDate(nextDate.getDate() + 7);
  } else if (cycle === 'yearly') {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  } else {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }

  return nextDate.toISOString().slice(0, 10);
}

export function RecurringListPage() {
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const recurringQuery = useRecurringTransactions(workspace?.id);
  const deactivateRecurring = useDeactivateRecurringTransaction(workspace?.id);
  const deleteRecurring = useDeleteRecurringTransaction(workspace?.id);
  const updateRecurring = useUpdateRecurringTransaction(workspace?.id);
  const createTransaction = useCreateTransaction(workspace?.id);
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

  const handleRunNow = async (item: RecurringTransaction) => {
    if (!item.wallet_id || !item.category_id) {
      toast({
        title: 'Data rutin belum lengkap',
        description: 'Pastikan transaksi rutin punya dompet dan kategori sebelum dicatat.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await createTransaction.mutateAsync({
        amount: item.amount,
        categoryId: item.category_id,
        destinationWalletId: '',
        note: item.note ?? `Dari transaksi rutin: ${item.title}`,
        title: item.title,
        transactionDate: new Date().toISOString().slice(0, 10),
        type: item.type,
        walletId: item.wallet_id
      });
      await updateRecurring.mutateAsync({
        recurringId: item.id,
        input: {
          amount: item.amount,
          categoryId: item.category_id,
          endDate: item.end_date ?? '',
          frequency: item.frequency,
          isActive: item.is_active,
          nextRunDate: advanceDate(item.next_run_date, item.frequency),
          note: item.note ?? '',
          startDate: item.start_date,
          title: item.title,
          type: item.type,
          walletId: item.wallet_id
        }
      });
      toast({ title: 'Transaksi rutin dicatat' });
    } catch (error) {
      toast({
        title: 'Gagal mencatat transaksi rutin',
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
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Transaksi Berulang</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Catat uang masuk atau uang keluar rutin tanpa membuat catatan otomatis.
            </p>
          </div>
          {canManage ? (
            <Button asChild>
              <Link to="/app/recurring/new">
                <Plus className="size-4" />
                Tambah Rutin
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
            ctaLabel="Tambah Rutin"
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
            onRun={canManage ? handleRunNow : undefined}
          />
        ) : null}
      </section>
    </main>
  );
}
