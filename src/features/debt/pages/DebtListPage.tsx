import { CheckCircle2, Coins, Landmark, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { DebtList } from '@features/debt/components/DebtList';
import { DebtEmptyState, DebtErrorState, DebtSkeleton } from '@features/debt/components/DebtStates';
import { useDebts, useDeleteDebt } from '@features/debt/hooks/useDebts';
import type { DebtWithProgress } from '@features/debt/types/debt.types';
import { ModuleInfoTip } from '@shared/components/ModuleInfoTip';
import { ModuleSummaryCard } from '@shared/components/ModuleSummaryCard';
import { SectionHeaderAction } from '@shared/components/SectionHeaderAction';
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

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  style: 'currency',
  maximumFractionDigits: 0
});

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
  const activeDebts = useMemo(() => filterByStatus(debts, 'active', getDebtDisplayStatus), [debts]);
  const principalTotal = activeDebts.reduce((total, debt) => total + debt.principal_amount, 0);
  const paidTotal = activeDebts.reduce((total, debt) => total + debt.paid_amount, 0);
  const remainingTotal = activeDebts.reduce((total, debt) => total + debt.remaining_amount, 0);

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
    <main className="min-h-svh bg-background px-4 pb-28 pt-6 text-foreground sm:py-8">
      <section className="mx-auto w-full max-w-6xl">
        <SectionHeaderAction
          action={
            <Button asChild className="w-full rounded-full sm:w-auto">
              <Link to="/app/debts/new">
                <Plus className="size-4" />
                Tambah Hutang
              </Link>
            </Button>
          }
          description="Catat hutang, cicilan, pembayaran, dan progres pelunasan."
          eyebrow={workspace.name}
          title="Hutang"
        />

        <div className="mb-4">
          <SectionStatusTabs options={statusFilterOptions} value={statusFilter} onChange={setStatusFilter} />
        </div>

        <div className="mb-5">
          <ModuleSummaryCard
            stats={[
              { icon: Landmark, label: 'Hutang Aktif', value: moneyFormatter.format(principalTotal) },
              { icon: CheckCircle2, label: 'Sudah Dibayar', tone: 'good', value: moneyFormatter.format(paidTotal) },
              { icon: Coins, label: 'Sisa Hutang', tone: 'warn', value: moneyFormatter.format(remainingTotal) }
            ]}
          />
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

        {!debtsQuery.isLoading && !debtsQuery.isError ? (
          <ModuleInfoTip>
            Catat pembayaran secara rutin agar sisa hutang dan progres pelunasan tetap mudah dipantau.
          </ModuleInfoTip>
        ) : null}
      </section>
    </main>
  );
}
