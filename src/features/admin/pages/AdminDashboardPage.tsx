import { ArrowLeft, CreditCard, LayoutDashboard } from 'lucide-react';
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
          <Button asChild>
            <Link to="/admin/payments">
              <CreditCard className="size-4" />
              Payment Requests
            </Link>
          </Button>
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
                <CardDescription>Pending</CardDescription>
                <CardTitle>{statsQuery.data.pending}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Approved</CardDescription>
                <CardTitle>{statsQuery.data.approved}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Rejected</CardDescription>
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
                Approve akan mengaktifkan subscription workspace selama 30 hari melalui RPC database.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
