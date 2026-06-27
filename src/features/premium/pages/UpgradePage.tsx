import { ArrowLeft } from 'lucide-react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { useAuth } from '@features/auth';
import { PaymentProofPreviewPanel, PaymentProofUploadForm } from '@features/premium/components/PaymentProofUpload';
import { ManualPaymentInstructions, PlanCard } from '@features/premium/components/PremiumCards';
import { PremiumErrorState, PremiumSkeleton } from '@features/premium/components/PremiumStates';
import {
  useBillingData,
  useCreatePaymentRequest,
  usePaymentProofPreview,
  useUploadPaymentProof
} from '@features/premium/hooks/usePremium';
import type { Plan } from '@features/premium/types/premium.types';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

export function UpgradePage() {
  const { user } = useAuth();
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const billingQuery = useBillingData(workspace?.id);
  const createPaymentRequest = useCreatePaymentRequest(workspace?.id, user?.id);
  const uploadPaymentProof = useUploadPaymentProof(workspace?.id, user?.id);
  const pendingRequest =
    billingQuery.data?.paymentRequests.find((request) => request.status === 'pending') ?? null;
  const proofPreviewQuery = usePaymentProofPreview(pendingRequest?.proof_url);

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  const handleUpgrade = async (plan: Plan) => {
    try {
      await createPaymentRequest.mutateAsync(plan);
      toast({
        title: 'Payment request dibuat',
        description: 'Silakan lanjutkan pembayaran manual lalu upload bukti pembayaran.'
      });
    } catch (error) {
      toast({
        title: 'Gagal membuat payment request',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const handleUploadProof = async (file: File) => {
    if (!pendingRequest) {
      return;
    }

    try {
      await uploadPaymentProof.mutateAsync({
        file,
        paymentRequest: pendingRequest
      });
      toast({ title: 'Bukti pembayaran diupload' });
    } catch (error) {
      toast({
        title: 'Gagal upload bukti pembayaran',
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
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Upgrade</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Pilih paket Premium. Pembayaran saat ini masih diproses manual.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/app/billing">Billing</Link>
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
          <div className="space-y-4">
            <ManualPaymentInstructions request={pendingRequest} />
            {pendingRequest && !pendingRequest.proof_url ? (
              <PaymentProofUploadForm
                isUploading={uploadPaymentProof.isPending}
                onSubmit={handleUploadProof}
              />
            ) : null}
            {pendingRequest?.proof_url ? (
              <PaymentProofPreviewPanel preview={proofPreviewQuery.data ?? null} />
            ) : null}
            <div className="grid gap-4 md:grid-cols-3">
              {billingQuery.data.plans.map((plan) => (
                <PlanCard
                  activePlanCode={billingQuery.data.subscription.plan_code}
                  isPending={billingQuery.data.paymentRequests.some(
                    (request) => request.plan_code === plan.code && request.status === 'pending'
                  )}
                  isSubmitting={createPaymentRequest.isPending}
                  key={plan.code}
                  onUpgrade={handleUpgrade}
                  plan={plan}
                />
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
