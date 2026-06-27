import { Check, Clock, Eye, FileCheck, Lock, Sparkles, Upload } from 'lucide-react';
import { Link } from 'react-router';

import type { PaymentRequest, Plan, WorkspaceSubscription } from '@features/premium/types/premium.types';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';

type PlanCardProps = {
  activePlanCode: string;
  isPending: boolean;
  isSubmitting: boolean;
  onUpgrade: (plan: Plan) => void;
  plan: Plan;
};

type BillingSummaryProps = {
  activePlan: Plan;
  subscription: WorkspaceSubscription;
};

type PaymentRequestListProps = {
  onUploadProof?: (request: PaymentRequest) => void;
  onViewProof?: (request: PaymentRequest) => void;
  requests: PaymentRequest[];
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

const featureLabels: Record<string, string> = {
  advanced_report: 'Advanced report',
  ai_insight: 'AI insight',
  export: 'Export data',
  family_workspace: 'Family workspace'
};

function formatLimit(value: number | null, fallback: string) {
  return value === null ? 'Unlimited' : `${value} ${fallback}`;
}

function formatPlanPrice(plan: Plan) {
  if (plan.price_monthly <= 0) {
    return 'Gratis';
  }

  return `${moneyFormatter.format(plan.price_monthly)}/bulan`;
}

function statusClass(status: string) {
  if (status === 'approved' || status === 'active') {
    return 'bg-primary/10 text-primary';
  }

  if (status === 'pending') {
    return 'bg-secondary text-foreground';
  }

  return 'bg-destructive/10 text-destructive';
}

export function PlanCard({ activePlanCode, isPending, isSubmitting, onUpgrade, plan }: PlanCardProps) {
  const isCurrent = activePlanCode === plan.code;
  const features = Object.entries(plan.features);

  return (
    <Card className={cn(plan.code !== 'free' && 'border-primary/50')}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </div>
          {plan.code !== 'free' ? <Sparkles className="size-5 text-primary" /> : <Lock className="size-5 text-muted-foreground" />}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-normal">{formatPlanPrice(plan)}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tahunan {plan.price_yearly > 0 ? moneyFormatter.format(plan.price_yearly) : 'gratis'}
        </p>

        <div className="mt-5 grid gap-2 text-sm">
          <p>{formatLimit(plan.max_workspaces, 'workspace')}</p>
          <p>{formatLimit(plan.max_members, 'member')}</p>
          <p>{formatLimit(plan.max_wallets, 'wallet')}</p>
          <p>{formatLimit(plan.max_transactions_per_month, 'transaksi/bulan')}</p>
        </div>

        <div className="mt-5 space-y-2 text-sm">
          {features.map(([key, enabled]) => (
            <div className="flex items-center gap-2" key={key}>
              <span
                className={cn(
                  'flex size-5 items-center justify-center rounded-full',
                  enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                )}
              >
                <Check className="size-3" />
              </span>
              <span className={enabled ? '' : 'text-muted-foreground'}>
                {featureLabels[key] ?? key}
                {!enabled ? ' tidak aktif' : ''}
              </span>
            </div>
          ))}
        </div>

        <Button
          className="mt-6 w-full"
          disabled={isCurrent || isPending || isSubmitting || plan.code === 'free'}
          onClick={() => onUpgrade(plan)}
          type="button"
          variant={isCurrent ? 'outline' : 'default'}
        >
          {isCurrent ? 'Plan aktif' : isPending ? 'Request pending' : 'Upgrade'}
        </Button>
      </CardContent>
    </Card>
  );
}

export function ManualPaymentInstructions({ request }: { request: PaymentRequest | null }) {
  if (!request) {
    return null;
  }

  return (
    <div className="rounded-md border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-start gap-3">
        <Clock className="mt-0.5 size-5 text-primary" />
        <div>
          <h2 className="font-semibold">Instruksi pembayaran manual</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Request upgrade sudah dibuat dengan status pending.
          </p>
          <div className="mt-4 grid gap-2 text-sm">
            <p>Plan: {request.plan_code}</p>
            <p>Amount: {moneyFormatter.format(request.amount)}</p>
            <p>Metode: Transfer manual</p>
            <p>Upload bukti pembayaran tersedia di halaman ini atau Billing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BillingSummary({ activePlan, subscription }: BillingSummaryProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardDescription>Plan aktif</CardDescription>
          <CardTitle>{activePlan.name}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Status subscription</CardDescription>
          <CardTitle className="capitalize">{subscription.status}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Expired at</CardDescription>
          <CardTitle className="text-xl">
            {subscription.expired_at ? dateFormatter.format(new Date(subscription.expired_at)) : 'Tidak ada'}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

export function PaymentRequestList({ onUploadProof, onViewProof, requests }: PaymentRequestListProps) {
  return (
    <div className="grid gap-3">
      {requests.map((request) => (
        <article className="rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm" key={request.id}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{request.plan_code}</h2>
                <span className={cn('rounded-sm px-2 py-0.5 text-xs font-medium capitalize', statusClass(request.status))}>
                  {request.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {dateFormatter.format(new Date(request.created_at))}
              </p>
              {request.rejected_reason ? (
                <p className="mt-2 text-sm text-destructive">{request.rejected_reason}</p>
              ) : null}
              {request.proof_url ? (
                <p className="mt-2 inline-flex items-center gap-2 rounded-sm bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  <FileCheck className="size-3" />
                  Bukti sudah diupload
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Bukti belum diupload</p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <p className="font-semibold">{moneyFormatter.format(request.amount)}</p>
              {request.proof_url && onViewProof ? (
                <Button onClick={() => onViewProof(request)} size="sm" type="button" variant="outline">
                  <Eye className="size-4" />
                  Lihat Bukti
                </Button>
              ) : null}
              {!request.proof_url && request.status === 'pending' && onUploadProof ? (
                <Button onClick={() => onUploadProof(request)} size="sm" type="button" variant="outline">
                  <Upload className="size-4" />
                  Upload Bukti
                </Button>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function UpgradeNotice() {
  return (
    <div className="rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm">
      <p className="text-sm text-muted-foreground">Butuh lebih banyak wallet?</p>
      <p className="mt-1 font-semibold">Upgrade ke Premium untuk membuka limit wallet.</p>
      <Button asChild className="mt-4">
        <Link to="/app/upgrade">Lihat Paket</Link>
      </Button>
    </div>
  );
}
