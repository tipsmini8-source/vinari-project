import { ArrowLeft, Lock, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { useAuth } from '@features/auth';
import { usePlan } from '@features/premium';
import { WalletDetailPanel } from '@features/wallet/components/WalletDetailPanel';
import { WalletForm } from '@features/wallet/components/WalletForm';
import { WalletList } from '@features/wallet/components/WalletList';
import { WalletEmptyState, WalletErrorState, WalletSkeleton } from '@features/wallet/components/WalletStates';
import {
  useArchiveWallet,
  useCreateWallet,
  useDeleteWallet,
  useUpdateWallet,
  useWalletDetail,
  useWallets
} from '@features/wallet/hooks/useWallets';
import type { Wallet, WalletFormInput } from '@features/wallet/types/wallet.types';
import { Button } from '@shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

type PanelMode = 'create' | 'edit' | null;

export function WalletPage() {
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>();
  const { user } = useAuth();
  const { loading: workspaceLoading, workspace } = useWorkspace();
  const activeWorkspace = workspace ?? undefined;
  const { toast } = useToast();
  const walletsQuery = useWallets(activeWorkspace?.id);
  const createWallet = useCreateWallet(activeWorkspace);
  const updateWallet = useUpdateWallet(activeWorkspace?.id);
  const archiveWallet = useArchiveWallet(activeWorkspace?.id);
  const deleteWallet = useDeleteWallet(activeWorkspace?.id);
  const planQuery = usePlan();

  const wallets = useMemo(() => walletsQuery.data ?? [], [walletsQuery.data]);
  const activeWalletCount = wallets.filter((wallet) => !wallet.is_archived).length;
  const walletLimit = planQuery.activePlan?.max_wallets ?? null;
  const isWalletLimitReached =
    planQuery.activePlan?.code === 'free' && walletLimit !== null && activeWalletCount >= walletLimit;
  const effectiveSelectedWalletId = selectedWalletId ?? wallets[0]?.id;
  const detailQuery = useWalletDetail(effectiveSelectedWalletId, activeWorkspace?.id);

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (workspaceLoading) {
    return <GlobalLoading />;
  }

  if (!activeWorkspace) {
    return <Navigate replace to="/onboarding" />;
  }

  const openCreatePanel = () => {
    if (isWalletLimitReached) {
      toast({
        title: 'Limit dompet Free tercapai',
        description: 'Upgrade ke Premium untuk menambah dompet lagi.'
      });
      return;
    }

    setEditingWallet(null);
    setPanelMode('create');
  };

  const openEditPanel = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setPanelMode('edit');
  };

  const closePanel = () => {
    setEditingWallet(null);
    setPanelMode(null);
  };

  const handleSubmit = async (input: WalletFormInput) => {
    try {
      if (panelMode === 'edit' && editingWallet) {
        await updateWallet.mutateAsync({ walletId: editingWallet.id, input });
        toast({ title: 'Dompet diperbarui' });
      } else {
        const wallet = await createWallet.mutateAsync(input);
        setSelectedWalletId(wallet.id);
        toast({ title: 'Dompet ditambahkan' });
      }

      closePanel();
    } catch (error) {
      toast({
        title: panelMode === 'edit' ? 'Gagal mengubah dompet' : 'Gagal menambah dompet',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const handleArchive = async (wallet: Wallet) => {
    const confirmed = window.confirm(`Arsipkan dompet "${wallet.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await archiveWallet.mutateAsync(wallet.id);
      toast({ title: 'Dompet diarsipkan', description: `${wallet.name} sudah masuk arsip.` });
    } catch (error) {
      toast({
        title: 'Gagal mengarsipkan dompet',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (wallet: Wallet) => {
    const confirmed = window.confirm(
      `Hapus dompet "${wallet.name}"? Dompet hanya bisa dihapus jika belum memiliki catatan uang.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteWallet.mutateAsync(wallet.id);
      if (effectiveSelectedWalletId === wallet.id) {
        setSelectedWalletId(undefined);
      }
      toast({ title: 'Dompet dihapus', description: `${wallet.name} sudah dihapus.` });
    } catch (error) {
      toast({
        title: 'Dompet tidak bisa dihapus',
        description:
          error instanceof Error
            ? error.message
            : 'Dompet ini mungkin sudah memiliki catatan uang. Arsipkan dompet sebagai alternatif.',
        variant: 'destructive'
      });
    }
  };

  const isFormSubmitting = createWallet.isPending || updateWallet.isPending;

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
            <p className="text-sm font-medium text-primary">{activeWorkspace.name}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Dompet</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Kelola sumber uang dan saldo aktif di ruang keuangan ini.
            </p>
          </div>
          {isWalletLimitReached ? (
            <Button asChild>
              <Link to="/app/upgrade">
                <Lock className="size-4" />
                Upgrade untuk Dompet
              </Link>
            </Button>
          ) : (
            <Button onClick={openCreatePanel} type="button">
              <Plus className="size-4" />
              Tambah Dompet
            </Button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-4">
            {panelMode ? (
              <Card>
                <CardHeader>
                  <CardTitle>{panelMode === 'edit' ? 'Edit Dompet' : 'Tambah Dompet'}</CardTitle>
                  <CardDescription>
                    Isi data dompet dengan jelas agar catatan uang mudah dibaca.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WalletForm
                    defaultWallet={editingWallet}
                    isSubmitting={isFormSubmitting}
                    onCancel={closePanel}
                    onSubmit={handleSubmit}
                  />
                </CardContent>
              </Card>
            ) : null}

            {walletsQuery.isLoading ? <WalletSkeleton /> : null}

            {walletsQuery.isError ? (
              <WalletErrorState
                message={walletsQuery.error instanceof Error ? walletsQuery.error.message : 'Terjadi kesalahan.'}
                onRetry={() => void walletsQuery.refetch()}
              />
            ) : null}

            {!walletsQuery.isLoading && !walletsQuery.isError && wallets.length === 0 ? (
              <WalletEmptyState onCreate={openCreatePanel} />
            ) : null}

            {!walletsQuery.isLoading && !walletsQuery.isError && wallets.length > 0 ? (
              <WalletList
                onArchive={handleArchive}
                onDelete={handleDelete}
                onEdit={openEditPanel}
                onSelect={(wallet) => setSelectedWalletId(wallet.id)}
                selectedWalletId={effectiveSelectedWalletId}
                wallets={wallets}
              />
            ) : null}
          </div>

          <WalletDetailPanel detail={detailQuery.data} isLoading={detailQuery.isLoading} />
        </div>
      </section>
    </main>
  );
}
