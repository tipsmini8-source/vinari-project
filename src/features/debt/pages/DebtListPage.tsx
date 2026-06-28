import { ArrowLeft, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { DebtList } from '@features/debt/components/DebtList';
import { DebtEmptyState, DebtErrorState, DebtSkeleton } from '@features/debt/components/DebtStates';
import { useDebts, useDeleteDebt } from '@features/debt/hooks/useDebts';
import type { DebtWithProgress } from '@features/debt/types/debt.types';
import { SectionStatusTabs } from '@shared/components/SectionStatusTabs';
import { StatusFilterEmptyState } from '@shared/components/StatusFilterEmptyState';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';
import {
  filterByStatus,
  getDebtDisplayStatus,
  statusFilterOptions,
  type StatusFilterValue
} from '@shared/utils/statusFilters';

export function DebtListPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('active');
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const debtsQuery = useDebts(workspace?.id);
  const deleteDebt = useDeleteDebt(workspace?.id);
  const debts = useMemo(() => debtsQuery.data ?? [], [debtsQuery.data]);
  const filteredDebts = useMemo(
    () => filterByStatus(debts, statusFilter, getDebtDisplayStatus),
    [debts, statusFilter]
  );

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  const handleDelete = async (debt: DebtWithProgress) => {
    const confirmed = window.confirm(`Hapus hutang "${debt.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteDebt.mutateAsync(debt.id);
      toast({ title: 'Hutang dihapus' });
    } catch (error) {
      toast({
        title: 'Gagal menghapus hutang',
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
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Hutang</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Catat hutang, cicilan, pembayaran, dan progress pelunasan.
            </p>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SectionStatusTabs options={statusFilterOptions} value={statusFilter} onChange={setStatusFilter} />
          <Button asChild className="w-full rounded-full sm:w-auto">
            <Link to="/app/debts/new">
              <Plus className="size-4" />
              Tambah Hutang
            </Link>
          </Button>
        </div>

        {debtsQuery.isLoading ? <DebtSkeleton /> : null}

        {debtsQuery.isError ? (
          <DebtErrorState
            message={debtsQuery.error instanceof Error ? debtsQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void debtsQuery.refetch()}
          />
        ) : null}

        {!debtsQuery.isLoading && !debtsQuery.isError && debts.length === 0 ? (
          <DebtEmptyState />
        ) : null}

        {!debtsQuery.isLoading && !debtsQuery.isError && debts.length > 0 && filteredDebts.length === 0 ? (
          <StatusFilterEmptyState
            createHref="/app/debts/new"
            ctaLabel="Tambah Hutang"
            description="Coba pilih status lain atau catat hutang baru."
            filter={statusFilter}
          />
        ) : null}

        {!debtsQuery.isLoading && !debtsQuery.isError && filteredDebts.length > 0 ? (
          <DebtList debts={filteredDebts} onDelete={handleDelete} />
        ) : null}
      </section>
    </main>
  );
}
