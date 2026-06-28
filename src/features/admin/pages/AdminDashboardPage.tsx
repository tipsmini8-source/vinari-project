import { ArrowLeft, CreditCard, LayoutDashboard, QrCode } from 'lucide-react';
import { Link } from 'react-router';

import { AdminErrorState, AdminSkeleton } from '@features/admin/components/AdminStates';
import { useAdminPaymentStats } from '@features/admin/hooks/useAdmin';
import { Button } from '@shared/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';

export function AdminDashboardPage() {
  const statsQuery = useAdminPaymentStats();

  return (
    <main className="min-h-svh bg-background px-4 py-8 text-foreground">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button asChild className="mb-3" size="sm" variant="ghost">
              <Link to="/app">
                <ArrowLeft className="size-4" />
                Kembali ke App
              </Link>
            </Button>
            <p className="text-sm font-medium text-primary">Vinari Admin</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ringkasan approval pembayaran manual premium.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/admin/payments">
                <CreditCard className="size-4" />
                Permintaan Upgrade
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/payment-methods">
                <QrCode className="size-4" />
                Metode Pembayaran
              </Link>
            </Button>
          </div>
        </div>

        {statsQuery.isLoading ? <AdminSkeleton /> : null}

        {statsQuery.isError ? (
          <AdminErrorState
            message={statsQuery.error instanceof Error ? statsQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void statsQuery.refetch()}
          />
        ) : null}

        {statsQuery.data ? (
          <div className="grid gap-3 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardDescription>Menunggu Dicek</CardDescription>
                <CardTitle>{statsQuery.data.pending}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Disetujui</CardDescription>
                <CardTitle>{statsQuery.data.approved}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Ditolak</CardDescription>
                <CardTitle>{statsQuery.data.rejected}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        ) : null}

        <div className="mt-6 rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="flex items-start gap-3">
            <LayoutDashboard className="mt-0.5 size-5 text-primary" />
            <div>
              <h2 className="font-semibold">Approval manual</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Persetujuan akan mengaktifkan paket premium ruang keuangan selama 30 hari.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
