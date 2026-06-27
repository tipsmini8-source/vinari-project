import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { useAuth } from '@features/auth';
import { PaymentProofPreviewPanel, PaymentProofUploadForm } from '@features/premium/components/PaymentProofUpload';
import { BillingSummary, PaymentRequestList } from '@features/premium/components/PremiumCards';
import {
  PremiumEmptyRequests,
  PremiumErrorState,
  PremiumSkeleton
} from '@features/premium/components/PremiumStates';
import {
  useBillingData,
  usePaymentProofPreview,
  useUploadPaymentProof
} from '@features/premium/hooks/usePremium';
import type { PaymentRequest } from '@features/premium/types/premium.types';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

export function BillingPage() {
  const { user } = useAuth();
  const [uploadRequest, setUploadRequest] = useState<PaymentRequest | null>(null);
  const [previewProofUrl, setPreviewProofUrl] = useState<string | null>(null);
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const billingQuery = useBillingData(workspace?.id);
  const uploadPaymentProof = useUploadPaymentProof(workspace?.id, user?.id);
  const proofPreviewQuery = usePaymentProofPreview(previewProofUrl);

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  const handleUploadProof = async (file: File) => {
    if (!uploadRequest) {
      return;
    }

    try {
      const proofPath = await uploadPaymentProof.mutateAsync({
        file,
        paymentRequest: uploadRequest
      });
      setPreviewProofUrl(proofPath);
      setUploadRequest(null);
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

            {uploadRequest ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold tracking-normal">Upload Bukti</h2>
                  <Button onClick={() => setUploadRequest(null)} type="button" variant="ghost">
                    Batal
                  </Button>
                </div>
                <PaymentProofUploadForm
                  isUploading={uploadPaymentProof.isPending}
                  onSubmit={handleUploadProof}
                />
              </div>
            ) : null}

            {previewProofUrl ? (
              <PaymentProofPreviewPanel preview={proofPreviewQuery.data ?? null} />
            ) : null}

            <div>
              <h2 className="mb-3 text-xl font-semibold tracking-normal">Payment Request</h2>
              {billingQuery.data.paymentRequests.length > 0 ? (
                <PaymentRequestList
                  onUploadProof={(request) => {
                    setPreviewProofUrl(null);
                    setUploadRequest(request);
                  }}
                  onViewProof={(request) => {
                    setUploadRequest(null);
                    setPreviewProofUrl(request.proof_url);
                  }}
                  requests={billingQuery.data.paymentRequests}
                />
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
