import { ArrowLeft, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { AdminPaymentMethodForm } from '@features/admin/components/AdminPaymentMethodForm';
import { AdminPaymentMethodList } from '@features/admin/components/AdminPaymentMethodList';
import { AdminEmptyState, AdminErrorState, AdminSkeleton } from '@features/admin/components/AdminStates';
import {
  useAdminPaymentMethods,
  useCreateAdminPaymentMethod,
  useDeleteAdminPaymentMethod,
  useToggleAdminPaymentMethod,
  useUpdateAdminPaymentMethod
} from '@features/admin/hooks/useAdmin';
import type { PaymentMethodFormInput } from '@features/admin/schemas/payment-method.schemas';
import type { AdminPaymentMethod } from '@features/admin/types/admin.types';
import { Button } from '@shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { useToast } from '@shared/ui/use-toast';

type PanelMode = 'create' | 'edit' | null;

export function AdminPaymentMethodsPage() {
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [editingMethod, setEditingMethod] = useState<AdminPaymentMethod | null>(null);
  const { toast } = useToast();
  const paymentMethodsQuery = useAdminPaymentMethods();
  const createMethod = useCreateAdminPaymentMethod();
  const updateMethod = useUpdateAdminPaymentMethod();
  const toggleMethod = useToggleAdminPaymentMethod();
  const deleteMethod = useDeleteAdminPaymentMethod();
  const isMutating =
    createMethod.isPending || updateMethod.isPending || toggleMethod.isPending || deleteMethod.isPending;

  const closePanel = () => {
    setPanelMode(null);
    setEditingMethod(null);
  };

  const handleSubmit = async (input: PaymentMethodFormInput) => {
    try {
      if (panelMode === 'edit' && editingMethod) {
        await updateMethod.mutateAsync({
          input,
          paymentMethod: editingMethod
        });
        toast({ title: 'Metode pembayaran diperbarui' });
      } else {
        await createMethod.mutateAsync(input);
        toast({ title: 'Metode pembayaran dibuat' });
      }

      closePanel();
    } catch (error) {
      toast({
        title: 'Gagal menyimpan metode pembayaran',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const handleToggle = async (method: AdminPaymentMethod) => {
    try {
      await toggleMethod.mutateAsync(method);
      toast({ title: method.is_active ? 'Metode dinonaktifkan' : 'Metode diaktifkan' });
    } catch (error) {
      toast({
        title: 'Gagal mengubah status metode',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (method: AdminPaymentMethod) => {
    const confirmed = window.confirm(`Hapus metode pembayaran "${method.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteMethod.mutateAsync(method.id);
      toast({ title: 'Metode pembayaran dihapus' });
    } catch (error) {
      toast({
        title: 'Gagal menghapus metode pembayaran',
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
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Payment Methods</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Kelola QRIS dan metode pembayaran manual untuk premium.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingMethod(null);
              setPanelMode('create');
            }}
            type="button"
          >
            <Plus className="size-4" />
            Tambah Metode
          </Button>
        </div>

        {panelMode ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{panelMode === 'edit' ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}</CardTitle>
              <CardDescription>Upload QRIS dan instruksi pembayaran yang akan dilihat user.</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminPaymentMethodForm
                defaultMethod={editingMethod}
                isSubmitting={createMethod.isPending || updateMethod.isPending}
                onCancel={closePanel}
                onSubmit={handleSubmit}
              />
            </CardContent>
          </Card>
        ) : null}

        {paymentMethodsQuery.isLoading ? <AdminSkeleton /> : null}

        {paymentMethodsQuery.isError ? (
          <AdminErrorState
            message={paymentMethodsQuery.error instanceof Error ? paymentMethodsQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void paymentMethodsQuery.refetch()}
          />
        ) : null}

        {!paymentMethodsQuery.isLoading && !paymentMethodsQuery.isError && (paymentMethodsQuery.data ?? []).length === 0 ? (
          <AdminEmptyState />
        ) : null}

        {!paymentMethodsQuery.isLoading && !paymentMethodsQuery.isError && (paymentMethodsQuery.data ?? []).length > 0 ? (
          <AdminPaymentMethodList
            isMutating={isMutating}
            methods={paymentMethodsQuery.data ?? []}
            onDelete={handleDelete}
            onEdit={(method) => {
              setEditingMethod(method);
              setPanelMode('edit');
            }}
            onToggle={handleToggle}
          />
        ) : null}
      </section>
    </main>
  );
}
