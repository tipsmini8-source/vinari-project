import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { AdminPaymentList } from '@features/admin/components/AdminPaymentList';
import { AdminEmptyState, AdminErrorState, AdminSkeleton } from '@features/admin/components/AdminStates';
import {
  useAdminPaymentRequests,
  useApprovePaymentRequest,
  useRejectPaymentRequest
} from '@features/admin/hooks/useAdmin';
import type { AdminPaymentRequest, AdminPaymentStatus } from '@features/admin/types/admin.types';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';
import { useToast } from '@shared/ui/use-toast';

const filters: Array<{ label: string; value: AdminPaymentStatus }> = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'All', value: 'all' }
];

export function AdminPaymentsPage() {
  const [status, setStatus] = useState<AdminPaymentStatus>('pending');
  const { toast } = useToast();
  const paymentsQuery = useAdminPaymentRequests(status);
  const approvePayment = useApprovePaymentRequest();
  const rejectPayment = useRejectPaymentRequest();
  const isMutating = approvePayment.isPending || rejectPayment.isPending;

  const handleApprove = async (request: AdminPaymentRequest) => {
    const confirmed = window.confirm(`Approve payment request ${request.plan_code}?`);

    if (!confirmed) {
      return;
    }

    try {
      await approvePayment.mutateAsync(request.id);
      toast({ title: 'Payment request approved' });
    } catch (error) {
      toast({
        title: 'Gagal approve payment request',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const handleReject = async (request: AdminPaymentRequest) => {
    const reason = window.prompt('Alasan reject pembayaran?');

    if (reason === null) {
      return;
    }

    try {
      await rejectPayment.mutateAsync({
        paymentRequestId: request.id,
        reason
      });
      toast({ title: 'Payment request rejected' });
    } catch (error) {
      toast({
        title: 'Gagal reject payment request',
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
              <Link to="/admin">
                <ArrowLeft className="size-4" />
                Kembali
              </Link>
            </Button>
            <p className="text-sm font-medium text-primary">Vinari Admin</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Payment Requests</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Review dan approve/reject pembayaran premium manual.
            </p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 rounded-md border border-border bg-card p-2 sm:flex">
          {filters.map((filter) => (
            <Button
              className={cn(status === filter.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}
              key={filter.value}
              onClick={() => setStatus(filter.value)}
              type="button"
              variant={status === filter.value ? 'default' : 'ghost'}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {paymentsQuery.isLoading ? <AdminSkeleton /> : null}

        {paymentsQuery.isError ? (
          <AdminErrorState
            message={paymentsQuery.error instanceof Error ? paymentsQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void paymentsQuery.refetch()}
          />
        ) : null}

        {!paymentsQuery.isLoading && !paymentsQuery.isError && (paymentsQuery.data ?? []).length === 0 ? (
          <AdminEmptyState />
        ) : null}

        {!paymentsQuery.isLoading && !paymentsQuery.isError && (paymentsQuery.data ?? []).length > 0 ? (
          <AdminPaymentList
            isMutating={isMutating}
            onApprove={handleApprove}
            onReject={handleReject}
            requests={paymentsQuery.data ?? []}
          />
        ) : null}
      </section>
    </main>
  );
}
