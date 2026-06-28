import { ArrowLeft, Plus } from 'lucide-react';
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
  useSubscriptions
} from '@features/recurring/hooks/useRecurring';
import { formatRecurringDate, formatRecurringMoney } from '@features/recurring/services/recurring-formatters';
import type { ScheduleCycle, Subscription } from '@features/recurring/types/recurring.types';
import { SectionStatusTabs } from '@shared/components/SectionStatusTabs';
import { StatusFilterEmptyState } from '@shared/components/StatusFilterEmptyState';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';
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

export function SubscriptionListPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('active');
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const subscriptionsQuery = useSubscriptions(workspace?.id);
  const deactivateSubscription = useDeactivateSubscription(workspace?.id);
  const deleteSubscription = useDeleteSubscription(workspace?.id);
  const canManage = canManageRecurring(workspace?.role);
  const subscriptions = useMemo(() => subscriptionsQuery.data ?? [], [subscriptionsQuery.data]);
  const filteredSubscriptions = useMemo(
    () => filterByStatus(subscriptions, statusFilter, getSubscriptionDisplayStatus),
    [subscriptions, statusFilter]
  );
  const activeSubscriptions = subscriptions.filter((item) => item.is_active);
  const nearestDue = activeSubscriptions[0] ?? null;
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
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Langganan</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Pantau langganan rutin dan biaya bulanan tanpa reminder otomatis.
            </p>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SectionStatusTabs options={statusFilterOptions} value={statusFilter} onChange={setStatusFilter} />
          {canManage ? (
            <Button asChild className="w-full rounded-full sm:w-auto">
              <Link to="/app/subscriptions/new">
                <Plus className="size-4" />
                Tambah Langganan
              </Link>
            </Button>
          ) : null}
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm">
            <p className="text-sm text-muted-foreground">Total biaya bulanan</p>
            <p className="mt-1 text-2xl font-semibold tracking-normal">{formatRecurringMoney(monthlyTotal)}</p>
          </div>
          <div className="rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm">
            <p className="text-sm text-muted-foreground">Jatuh tempo terdekat</p>
            <p className="mt-1 font-semibold">
              {nearestDue ? `${nearestDue.name} - ${formatRecurringDate(nearestDue.next_due_date)}` : 'Belum ada'}
            </p>
          </div>
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
          />
        ) : null}
      </section>
    </main>
  );
}
