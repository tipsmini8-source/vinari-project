import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { DebtPaymentForm } from '@features/debt/components/DebtPaymentForm';
import { DebtPaymentHistory } from '@features/debt/components/DebtPaymentHistory';
import { DebtProgress } from '@features/debt/components/DebtProgress';
import { DebtErrorState, DebtSkeleton } from '@features/debt/components/DebtStates';
import {
  useAddDebtPayment,
  useDebt,
  useDebtPayments,
  useDebtWallets,
  useDeleteDebt
} from '@features/debt/hooks/useDebts';
import type { DebtPaymentFormInput } from '@features/debt/types/debt.types';
import { Button } from '@shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  style: 'currency',
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium'
});

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : '-';
}

export function DebtDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const debtQuery = useDebt(id);
  const paymentsQuery = useDebtPayments(id);
  const walletsQuery = useDebtWallets(workspace?.id);
  const addPayment = useAddDebtPayment(workspace?.id);
  const deleteDebt = useDeleteDebt(workspace?.id);

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  if (!id) {
    return <Navigate replace to="/app/debts" />;
  }

  const debt = debtQuery.data;

  const handlePaymentSubmit = async (input: DebtPaymentFormInput) => {
    try {
      await addPayment.mutateAsync({ debtId: id, input });
      toast({ title: 'Pembayaran ditambahkan' });
    } catch (error) {
      toast({
        title: 'Gagal menambah pembayaran',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async () => {
    if (!debt) {
      return;
    }

    const confirmed = window.confirm(`Hapus hutang "${debt.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteDebt.mutateAsync(debt.id);
      toast({ title: 'Hutang dihapus' });
      void navigate('/app/debts');
    } catch (error) {
      toast({
        title: 'Gagal menghapus hutang',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  return (
    <main className="min-h-svh bg-background px-4 py-8 text-foreground">
      <section className="mx-auto w-full max-w-6xl">
        <Button asChild className="mb-4" size="sm" variant="ghost">
          <Link to="/app/debts">
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>

        {debtQuery.isLoading ? <DebtSkeleton /> : null}

        {debtQuery.isError ? (
          <DebtErrorState
            message={debtQuery.error instanceof Error ? debtQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void debtQuery.refetch()}
          />
        ) : null}

        {debt ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary">{workspace.name}</p>
                      <CardTitle className="mt-1">{debt.name}</CardTitle>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {debt.lender_name ?? 'Tanpa lender'} - jatuh tempo {formatDate(debt.due_date)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button asChild aria-label="Edit hutang" size="icon" variant="ghost">
                        <Link to={`/app/debts/${debt.id}/edit`}>
                          <Edit className="size-4" />
                        </Link>
                      </Button>
                      <Button aria-label="Hapus hutang" onClick={handleDelete} size="icon" type="button" variant="ghost">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <DebtProgress percentage={debt.percentage} status={debt.status} />
                  <div className="grid gap-3 text-sm sm:grid-cols-4">
                    <div>
                      <p className="text-muted-foreground">Principal</p>
                      <p className="font-medium">{moneyFormatter.format(debt.principal_amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Terbayar</p>
                      <p className="font-medium">{moneyFormatter.format(debt.paid_amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sisa</p>
                      <p className="font-medium">{moneyFormatter.format(debt.remaining_amount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Progress</p>
                      <p className="font-medium">{debt.percentage}%</p>
                    </div>
                  </div>
                  <div className="grid gap-3 text-sm sm:grid-cols-4">
                    <div className="rounded-md border border-border p-3">
                      <p className="text-muted-foreground">Status</p>
                      <p className="mt-1 font-medium capitalize">{debt.status}</p>
                    </div>
                    <div className="rounded-md border border-border p-3">
                      <p className="text-muted-foreground">Cicilan</p>
                      <p className="mt-1 font-medium">
                        {debt.installment_amount ? moneyFormatter.format(debt.installment_amount) : '-'}
                      </p>
                    </div>
                    <div className="rounded-md border border-border p-3">
                      <p className="text-muted-foreground">Bunga</p>
                      <p className="mt-1 font-medium">{debt.interest_rate}%</p>
                    </div>
                    <div className="rounded-md border border-border p-3">
                      <p className="text-muted-foreground">Periode</p>
                      <p className="mt-1 font-medium">
                        {formatDate(debt.start_date)} - {formatDate(debt.end_date)}
                      </p>
                    </div>
                  </div>
                  {debt.note ? <p className="text-sm text-muted-foreground">{debt.note}</p> : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  {paymentsQuery.isLoading ? <DebtSkeleton /> : null}
                  {!paymentsQuery.isLoading ? <DebtPaymentHistory payments={paymentsQuery.data ?? []} /> : null}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Tambah Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <DebtPaymentForm
                  isSubmitting={addPayment.isPending}
                  onSubmit={handlePaymentSubmit}
                  remainingAmount={debt.remaining_amount}
                  wallets={walletsQuery.data ?? []}
                />
              </CardContent>
            </Card>
          </div>
        ) : null}
      </section>
    </main>
  );
}
