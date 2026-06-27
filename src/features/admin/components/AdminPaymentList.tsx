import { CheckCircle2, Eye, XCircle } from 'lucide-react';

import type { AdminPaymentRequest } from '@features/admin/types/admin.types';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';

type AdminPaymentListProps = {
  isMutating: boolean;
  onApprove: (request: AdminPaymentRequest) => void;
  onReject: (request: AdminPaymentRequest) => void;
  onViewProof: (request: AdminPaymentRequest) => void;
  requests: AdminPaymentRequest[];
};

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  maximumFractionDigits: 0,
  style: 'currency'
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

function statusClass(status: string) {
  if (status === 'approved') {
    return 'bg-primary/10 text-primary';
  }

  if (status === 'pending') {
    return 'bg-secondary text-foreground';
  }

  return 'bg-destructive/10 text-destructive';
}

export function AdminPaymentList({
  isMutating,
  onApprove,
  onReject,
  onViewProof,
  requests
}: AdminPaymentListProps) {
  return (
    <div className="grid gap-3">
      {requests.map((request) => (
        <article className="rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm" key={request.id}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="break-words font-semibold">{request.plan_code}</h2>
                <span className={cn('rounded-sm px-2 py-0.5 text-xs font-medium capitalize', statusClass(request.status))}>
                  {request.status}
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-3">
                <p className="break-all">Workspace: {request.workspace_id}</p>
                <p className="break-all">User: {request.user_id}</p>
                <p>Method: {request.method ?? '-'}</p>
                <p>Amount: {moneyFormatter.format(request.amount)}</p>
                <p>Created: {dateFormatter.format(new Date(request.created_at))}</p>
                <p>
                  Proof:{' '}
                  {request.proof_url ? (
                    <span className="font-medium text-primary">Bukti tersedia</span>
                  ) : (
                    <span className="rounded-sm bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      Belum ada bukti
                    </span>
                  )}
                </p>
              </div>
              {request.rejected_reason ? (
                <p className="mt-3 text-sm text-destructive">Alasan reject: {request.rejected_reason}</p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              {request.proof_url ? (
                <Button onClick={() => onViewProof(request)} type="button" variant="outline">
                  <Eye className="size-4" />
                  Lihat Bukti
                </Button>
              ) : null}
              {request.status === 'pending' ? (
                <>
                <Button disabled={isMutating || !request.proof_url} onClick={() => onApprove(request)} type="button">
                  <CheckCircle2 className="size-4" />
                  Approve
                </Button>
                <Button disabled={isMutating} onClick={() => onReject(request)} type="button" variant="outline">
                  <XCircle className="size-4" />
                  Reject
                </Button>
                </>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
