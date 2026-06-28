import { CalendarClock, Coins, CreditCard, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { SubscriptionList } from '@features/recurring/components/RecurringLists';
import {
  RecurringErrorState,
  RecurringSkeleton,
  SubscriptionEmptyState
} from '@features/recurring/components/RecurringStates';
import {
  useDeactivateSubscription,
  useDeleteSubscription,
  useSubscriptions,
  useUpdateSubscription
} from '@features/recurring/hooks/useRecurring';
import { formatRecurringMoney } from '@features/recurring/services/recurring-formatters';
import type { ScheduleCycle, Subscription } from '@features/recurring/types/recurring.types';
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
  QuickExpensePaymentForm,
  type QuickExpensePaymentInput
} from '@shared/components/QuickExpensePaymentForm';
import {
  filterByStatus,
  getSubscriptionDisplayStatus,
  statusFilterOptions,
  type StatusFilterValue
} from '@shared/utils/statusFilters';

function canManageRecurring(role: string | undefined) {
  return role === 'owner' || role === 'partner' || role === 'member';
}

function monthlyEquivalent(amount: number, cycle: ScheduleCycle) {
  if (cycle === 'daily') {
    return amount * 30;
  }

  if (cycle === 'weekly') {
    return amount * 4;
  }

  if (cycle === 'yearly') {
    return amount / 12;
  }

  return amount;
}

function daysUntil(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  return Math.ceil((targetDate.getTime() - today.getTime()) / 86_400_000);
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

export function SubscriptionListPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('active');
  const [paymentSubscription, setPaymentSubscription] = useState<Subscription | null>(null);
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const subscriptionsQuery = useSubscriptions(workspace?.id);
  const deactivateSubscription = useDeactivateSubscription(workspace?.id);
  const deleteSubscription = useDeleteSubscription(workspace?.id);
  const updateSubscription = useUpdateSubscription(workspace?.id);
  const createTransaction = useCreateTransaction(workspace?.id);
  const transactionReferences = useTransactionReferences(workspace?.id);
  const canManage = canManageRecurring(workspace?.role);
  const subscriptions = useMemo(() => subscriptionsQuery.data ?? [], [subscriptionsQuery.data]);
  const filteredSubscriptions = useMemo(
    () => filterByStatus(subscriptions, statusFilter, getSubscriptionDisplayStatus),
    [subscriptions, statusFilter]
  );
  const activeSubscriptions = subscriptions.filter((item) => item.is_active);
  const dueSoonCount = activeSubscriptions.filter((item) => daysUntil(item.next_due_date) <= 7).length;
  const monthlyTotal = activeSubscriptions.reduce(
    (total, item) => total + monthlyEquivalent(item.amount, item.billing_cycle),
    0
  );

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  const handleDeactivate = async (item: Subscription) => {
    const confirmed = window.confirm(`Nonaktifkan langganan "${item.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deactivateSubscription.mutateAsync(item.id);
      toast({ title: 'Langganan dinonaktifkan' });
    } catch (error) {
      toast({
        title: 'Gagal menonaktifkan langganan',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (item: Subscription) => {
    const confirmed = window.confirm(`Hapus langganan "${item.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteSubscription.mutateAsync(item.id);
      toast({ title: 'Langganan dihapus' });
    } catch (error) {
      toast({
        title: 'Gagal menghapus langganan',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const expenseCategories = transactionReferences.categories.data?.filter((category) => category.type === 'expense') ?? [];
  const subscriptionCategory =
    expenseCategories.find((category) => /langganan|subscription|tagihan/i.test(category.name)) ?? expenseCategories[0];

  const handlePayment = async (input: QuickExpensePaymentInput) => {
    if (!paymentSubscription) {
      return;
    }

    try {
      await createTransaction.mutateAsync({
        amount: input.amount,
        categoryId: input.categoryId,
        destinationWalletId: '',
        note: input.note || `Pembayaran langganan: ${paymentSubscription.name}`,
        title: `Bayar ${paymentSubscription.name}`,
        transactionDate: input.paymentDate,
        type: 'expense',
        walletId: input.walletId
      });
      await updateSubscription.mutateAsync({
        subscriptionId: paymentSubscription.id,
        input: {
          amount: paymentSubscription.amount,
          billingCycle: paymentSubscription.billing_cycle,
          categoryId: paymentSubscription.category_id ?? input.categoryId,
          isActive: paymentSubscription.is_active,
          name: paymentSubscription.name,
          nextDueDate: advanceDate(paymentSubscription.next_due_date, paymentSubscription.billing_cycle),
          note: paymentSubscription.note ?? '',
          walletId: paymentSubscription.wallet_id ?? input.walletId
        }
      });
      setPaymentSubscription(null);
      toast({ title: 'Pembayaran langganan dicatat' });
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
            canManage ? (
              <Button asChild className="w-full rounded-full sm:w-auto">
                <Link to="/app/subscriptions/new">
                  <Plus className="size-4" />
                  Tambah Langganan
                </Link>
              </Button>
            ) : null
          }
          description="Pantau langganan rutin dan biaya bulanan tanpa reminder otomatis."
          eyebrow={workspace.name}
          title="Langganan"
        />

        <div className="mb-4">
          <SectionStatusTabs options={statusFilterOptions} value={statusFilter} onChange={setStatusFilter} />
        </div>

        <div className="mb-5">
          <ModuleSummaryCard
            stats={[
              { icon: CreditCard, label: 'Langganan Aktif', value: `${activeSubscriptions.length}` },
              { icon: Coins, label: 'Tagihan Bulanan', tone: 'warn', value: formatRecurringMoney(monthlyTotal) },
              {
                icon: CalendarClock,
                label: 'Segera Jatuh Tempo',
                tone: dueSoonCount > 0 ? 'warn' : 'good',
                value: dueSoonCount > 0 ? `${dueSoonCount} tagihan` : 'Belum ada'
              }
            ]}
          />
        </div>

        {subscriptionsQuery.isLoading ? <RecurringSkeleton /> : null}

        {subscriptionsQuery.isError ? (
          <RecurringErrorState
            message={subscriptionsQuery.error instanceof Error ? subscriptionsQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void subscriptionsQuery.refetch()}
          />
        ) : null}

        {!subscriptionsQuery.isLoading && !subscriptionsQuery.isError && subscriptions.length === 0 ? (
          <SubscriptionEmptyState
            canCreate={canManage}
            createHref="/app/subscriptions/new"
            ctaLabel="Tambah Langganan"
            description="Catat tagihan rutin seperti listrik, internet, BPJS, Netflix, Canva, atau cicilan."
            title="Belum ada langganan"
          />
        ) : null}

        {!subscriptionsQuery.isLoading &&
        !subscriptionsQuery.isError &&
        subscriptions.length > 0 &&
        filteredSubscriptions.length === 0 ? (
          <StatusFilterEmptyState
            canCreate={canManage}
            createHref="/app/subscriptions/new"
            ctaLabel="Tambah Langganan"
            description="Coba pilih status lain atau catat langganan baru."
            filter={statusFilter}
          />
        ) : null}

        {!subscriptionsQuery.isLoading && !subscriptionsQuery.isError && filteredSubscriptions.length > 0 ? (
          <SubscriptionList
            canManage={canManage}
            items={filteredSubscriptions}
            onDeactivate={handleDeactivate}
            onDelete={handleDelete}
            onPay={canManage ? setPaymentSubscription : undefined}
          />
        ) : null}

        {!subscriptionsQuery.isLoading && !subscriptionsQuery.isError ? (
          <ModuleInfoTip>
            Langganan hanya dicatat sebagai pengingat biaya rutin. Vinari belum menjalankan pembayaran otomatis.
          </ModuleInfoTip>
        ) : null}

        <ActionDialog
          description="Catat pembayaran langganan sebagai uang keluar dan majukan jadwal tagihan berikutnya."
          onClose={() => setPaymentSubscription(null)}
          open={Boolean(paymentSubscription)}
          title={paymentSubscription ? `Bayar ${paymentSubscription.name}` : 'Bayar Langganan'}
        >
          {paymentSubscription ? (
            <QuickExpensePaymentForm
              categories={expenseCategories}
              defaultAmount={paymentSubscription.amount}
              defaultCategoryId={paymentSubscription.category_id ?? subscriptionCategory?.id ?? ''}
              defaultNote={`Pembayaran langganan: ${paymentSubscription.name}`}
              defaultWalletId={paymentSubscription.wallet_id ?? transactionReferences.wallets.data?.[0]?.id ?? ''}
              isSubmitting={createTransaction.isPending || updateSubscription.isPending}
              onSubmit={handlePayment}
              submitLabel="Bayar"
              wallets={transactionReferences.wallets.data ?? []}
            />
          ) : null}
        </ActionDialog>
      </section>
    </main>
  );
}
