import { ArrowLeft } from 'lucide-react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { BillingSummary, PaymentRequestList } from '@features/premium/components/PremiumCards';
import {
  PremiumEmptyRequests,
  PremiumErrorState,
  PremiumSkeleton
} from '@features/premium/components/PremiumStates';
import { useBillingData } from '@features/premium/hooks/usePremium';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';

export function BillingPage() {
  const { loading, workspace } = useWorkspace();
  const billingQuery = useBillingData(workspace?.id);

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

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
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Billing</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Lihat plan aktif, status subscription, dan payment request workspace.
            </p>
          </div>
          <Button asChild>
            <Link to="/app/upgrade">Upgrade</Link>
          </Button>
        </div>

        {billingQuery.isLoading ? <PremiumSkeleton /> : null}

        {billingQuery.isError ? (
          <PremiumErrorState
            message={billingQuery.error instanceof Error ? billingQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void billingQuery.refetch()}
          />
        ) : null}

        {billingQuery.data ? (
          <div className="space-y-6">
            <BillingSummary
              activePlan={billingQuery.data.activePlan}
              subscription={billingQuery.data.subscription}
            />

            <div>
              <h2 className="mb-3 text-xl font-semibold tracking-normal">Payment Request</h2>
              {billingQuery.data.paymentRequests.length > 0 ? (
                <PaymentRequestList requests={billingQuery.data.paymentRequests} />
              ) : (
                <PremiumEmptyRequests />
              )}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
