import { CheckCircle2, Coins, Landmark, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { DebtList } from '@features/debt/components/DebtList';
import { DebtPaymentForm } from '@features/debt/components/DebtPaymentForm';
import { DebtEmptyState, DebtErrorState, DebtSkeleton } from '@features/debt/components/DebtStates';
import { useAddDebtPayment, useDebts, useDeleteDebt, useDebtWallets } from '@features/debt/hooks/useDebts';
import type { DebtPaymentFormInput, DebtWithProgress } from '@features/debt/types/debt.types';
import { useCreateTransaction, useTransactionReferences } from '@features/transaction/hooks/useTransactions';
import { ActionDialog } from '@shared/components/ActionDialog';
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

function canManagePlanning(role: string | undefined) {
  return role === 'owner' || role === 'partner' || role === 'member';
}

export function DebtListPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('active');
  const [paymentDebt, setPaymentDebt] = useState<DebtWithProgress | null>(null);
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const debtsQuery = useDebts(workspace?.id);
  const deleteDebt = useDeleteDebt(workspace?.id);
  const addPayment = useAddDebtPayment(workspace?.id);
  const createTransaction = useCreateTransaction(workspace?.id);
  const paymentWallets = useDebtWallets(workspace?.id);
  const transactionReferences = useTransactionReferences(workspace?.id);
  const canManage = canManagePlanning(workspace?.role);
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

  const expenseCategories = transactionReferences.categories.data?.filter((category) => category.type === 'expense') ?? [];
  const debtCategory =
    expenseCategories.find((category) => /hutang|cicilan|pinjaman/i.test(category.name)) ?? expenseCategories[0];

  const handlePayment = async (input: DebtPaymentFormInput) => {
    if (!paymentDebt) {
      return;
    }

    if (!input.walletId) {
      toast({
        title: 'Dompet wajib dipilih',
        description: 'Pilih dompet agar pembayaran hutang tercatat sebagai uang keluar.',
        variant: 'destructive'
      });
      return;
    }

    if (!debtCategory) {
      toast({
        title: 'Kategori belum tersedia',
        description: 'Tambahkan kategori uang keluar untuk hutang atau cicilan terlebih dulu.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await addPayment.mutateAsync({ debtId: paymentDebt.id, input });
      await createTransaction.mutateAsync({
        amount: input.amount,
        categoryId: debtCategory.id,
        destinationWalletId: '',
        note: input.note || `Pembayaran hutang: ${paymentDebt.name}`,
        title: `Bayar ${paymentDebt.name}`,
        transactionDate: input.paymentDate,
        type: 'expense',
        walletId: input.walletId
      });
      setPaymentDebt(null);
      toast({ title: 'Pembayaran hutang dicatat' });
    } catch (error) {
      toast({
        title: 'Gagal mencatat pembayaran',
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
          <DebtList debts={filteredDebts} onDelete={handleDelete} onPay={canManage ? setPaymentDebt : undefined} />
        ) : null}

        {!debtsQuery.isLoading && !debtsQuery.isError ? (
          <ModuleInfoTip>
            Catat pembayaran secara rutin agar sisa hutang dan progres pelunasan tetap mudah dipantau.
          </ModuleInfoTip>
        ) : null}

        <ActionDialog
          description="Catat pembayaran cicilan dan otomatis buat catatan uang keluar dari dompet yang dipilih."
          onClose={() => setPaymentDebt(null)}
          open={Boolean(paymentDebt)}
          title={paymentDebt ? `Bayar ${paymentDebt.name}` : 'Bayar Hutang'}
        >
          {paymentDebt ? (
            <DebtPaymentForm
              defaultAmount={Math.min(paymentDebt.installment_amount ?? paymentDebt.remaining_amount, paymentDebt.remaining_amount)}
              defaultWalletId={paymentWallets.data?.[0]?.id ?? ''}
              isSubmitting={addPayment.isPending || createTransaction.isPending}
              onSubmit={handlePayment}
              remainingAmount={paymentDebt.remaining_amount}
              submitLabel="Bayar"
              wallets={paymentWallets.data ?? []}
            />
          ) : null}
        </ActionDialog>
      </section>
    </main>
  );
}
