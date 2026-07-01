import { ArrowLeft, Copy, Lock, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate } from 'react-router';

import { canManageMembers, useWorkspace } from '@/core/workspace';
import { useAuth } from '@features/auth';
import { usePlan } from '@features/premium';
import { MemberInviteForm } from '@features/settings/components/MemberInviteForm';
import { SettingsErrorState, SettingsSectionCard, SettingsSkeleton } from '@features/settings/components/SettingsStates';
import { WorkspaceInvitationList, getInviteLink } from '@features/settings/components/WorkspaceInvitationList';
import { WorkspaceMemberList } from '@features/settings/components/WorkspaceMemberList';
import {
  useCancelWorkspaceInvitation,
  useCreateWorkspaceInvitation,
  usePendingWorkspaceInvitations,
  useRemoveWorkspaceMember,
  useUpdateWorkspaceMemberRole,
  useWorkspaceMembers
} from '@features/settings/hooks/useSettings';
import type {
  MemberInviteSubmitInput,
  WorkspaceInvitation,
  WorkspaceMember,
  WorkspaceMemberRole
} from '@features/settings/types/settings.types';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

export function MembersSettingsPage() {
  const [latestInvitation, setLatestInvitation] = useState<WorkspaceInvitation | null>(null);
  const { user } = useAuth();
  const { loading, refreshWorkspace, workspace } = useWorkspace();
  const { toast } = useToast();
  const planQuery = usePlan();
  const membersQuery = useWorkspaceMembers(workspace?.id);
  const pendingInvitationsQuery = usePendingWorkspaceInvitations(workspace?.id);
  const createInvitation = useCreateWorkspaceInvitation(workspace?.id, user?.id);
  const cancelInvitation = useCancelWorkspaceInvitation(workspace?.id);
  const updateRole = useUpdateWorkspaceMemberRole(workspace?.id, user?.id);
  const removeMember = useRemoveWorkspaceMember(workspace?.id, user?.id);

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: 'Link undangan disalin.' });
    } catch {
      toast({
        title: 'Gagal menyalin link',
        description: 'Silakan salin link secara manual.',
        variant: 'destructive'
      });
    }
  };

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return (
      <main className="min-h-svh bg-background px-4 py-8 text-foreground">
        <section className="mx-auto w-full max-w-3xl">
          <Button asChild className="mb-4" size="sm" variant="ghost">
            <Link to="/onboarding">
              <ArrowLeft className="size-4" />
              Kembali
            </Link>
          </Button>

          <div className="mb-6">
            <p className="text-sm font-medium text-primary">{user.email}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Undangan Ruang Keuangan</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Buka link undangan yang dibagikan owner untuk menerima akses ruang keuangan.
            </p>
          </div>

          <SettingsSectionCard
            description="Owner Vinari sekarang membagikan link undangan manual. Pastikan Anda login dengan email yang sama dengan undangan."
            title="Belum Ada Workspace Aktif"
          >
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/onboarding">Buat Workspace</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/app">Cek Workspace</Link>
              </Button>
            </div>
          </SettingsSectionCard>
        </section>
      </main>
    );
  }

  const members = membersQuery.data ?? [];
  const pendingInvitations = pendingInvitationsQuery.data ?? [];
  const manageable = canManageMembers(workspace.role);
  const maxMembers = planQuery.activePlan?.max_members ?? 1;
  const memberCount = members.filter((member) => member.status === 'active').length + pendingInvitations.length;
  const memberLimitReached = maxMembers !== null && memberCount >= maxMembers;
  const familyLocked = !planQuery.hasFeature('family_workspace');
  const actionPending =
    createInvitation.isPending ||
    cancelInvitation.isPending ||
    updateRole.isPending ||
    removeMember.isPending;

  const handleInvite = async (input: MemberInviteSubmitInput) => {
    try {
      const invitation = await createInvitation.mutateAsync(input);
      setLatestInvitation(invitation);
      toast({ title: 'Undangan berhasil dibuat' });
    } catch (error) {
      toast({
        title: 'Gagal membuat undangan',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const handleCancelInvitation = async (invitation: WorkspaceInvitation) => {
    const confirmed = window.confirm(`Batalkan undangan untuk "${invitation.email}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await cancelInvitation.mutateAsync(invitation.id);
      if (latestInvitation?.id === invitation.id) {
        setLatestInvitation(null);
      }
      toast({ title: 'Undangan dibatalkan' });
    } catch (error) {
      toast({
        title: 'Gagal membatalkan undangan',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const handleRoleChange = async (member: WorkspaceMember, role: WorkspaceMemberRole) => {
    if (member.role === role) {
      return;
    }

    try {
      await updateRole.mutateAsync({ memberId: member.id, role });
      await refreshWorkspace();
      toast({ title: 'Peran anggota diperbarui' });
    } catch (error) {
      toast({
        title: 'Gagal mengubah peran',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const handleRemove = async (member: WorkspaceMember) => {
    const confirmed = window.confirm(`Hapus anggota "${member.profile?.full_name || member.invite_email || member.id}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await removeMember.mutateAsync(member.id);
      await refreshWorkspace();
      toast({ title: 'Anggota dihapus' });
    } catch (error) {
      toast({
        title: 'Gagal menghapus anggota',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  return (
    <main className="min-h-svh bg-background px-4 py-8 text-foreground">
      <section className="mx-auto w-full max-w-4xl">
        <Button asChild className="mb-4" size="sm" variant="ghost">
          <Link to="/app/settings">
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>

        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-primary">{workspace.name}</p>
            <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
              {planQuery.activePlan?.name ?? 'Free'}
            </span>
            {familyLocked ? (
              <span className="rounded-full border border-warning/30 bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
                Family terkunci
              </span>
            ) : null}
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">Anggota Ruang Keuangan</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Kelola anggota keluarga atau tim yang bisa mengakses ruang keuangan aktif.
          </p>
        </div>

        {membersQuery.isLoading || pendingInvitationsQuery.isLoading || planQuery.isLoading ? <SettingsSkeleton /> : null}

        {membersQuery.isError || pendingInvitationsQuery.isError ? (
          <SettingsErrorState
            message={
              membersQuery.error instanceof Error
                ? membersQuery.error.message
                : pendingInvitationsQuery.error instanceof Error
                  ? pendingInvitationsQuery.error.message
                  : 'Terjadi kesalahan.'
            }
            onRetry={() => {
              void membersQuery.refetch();
              void pendingInvitationsQuery.refetch();
            }}
          />
        ) : null}

        {!membersQuery.isLoading && !pendingInvitationsQuery.isLoading && !membersQuery.isError && !pendingInvitationsQuery.isError ? (
          <div className="space-y-4">
            <SettingsSectionCard
              description={`${memberCount}/${maxMembers ?? 'Tanpa batas'} slot anggota terpakai.`}
              title="Undang Anggota"
            >
              {!manageable ? (
                <div className="rounded-md border border-border bg-background p-4 text-sm text-muted-foreground">
                  Hanya pemilik ruang keuangan yang bisa mengundang dan mengelola anggota.
                </div>
              ) : null}

              {manageable && memberLimitReached ? (
                <div className="rounded-md border border-warning/30 bg-warning/15 p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 size-5 text-warning" />
                    <div>
                      <h2 className="font-semibold text-warning">Limit anggota tercapai</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Paket saat ini membatasi ruang keuangan ke {maxMembers} anggota. Upgrade ke Premium Family untuk
                        menambah hingga 5 anggota.
                      </p>
                      <Button asChild className="mt-4" size="sm">
                        <Link to="/app/upgrade">Upgrade</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}

              {manageable && !memberLimitReached ? (
                <MemberInviteForm
                  disabled={actionPending}
                  isSubmitting={createInvitation.isPending}
                  onSubmit={handleInvite}
                />
              ) : null}

              {latestInvitation ? (
                <div className="mt-5 rounded-md border border-success/20 bg-success/10 p-4">
                  <h2 className="font-semibold text-success">Undangan berhasil dibuat</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Bagikan link ini ke anggota yang diundang.
                  </p>
                  <div className="mt-4 grid gap-2 text-sm">
                    <p>
                      <span className="font-medium">Email:</span> {latestInvitation.email}
                    </p>
                    <p>
                      <span className="font-medium">Role:</span> {latestInvitation.role}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span> pending
                    </p>
                    <p>
                      <span className="font-medium">Kedaluwarsa:</span>{' '}
                      {new Intl.DateTimeFormat('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }).format(new Date(latestInvitation.expires_at))}
                    </p>
                    <p className="break-all rounded-md border border-border bg-background px-3 py-2 text-xs">
                      {getInviteLink(latestInvitation.token)}
                    </p>
                  </div>
                  <Button
                    className="mt-4"
                    onClick={() => void handleCopyLink(getInviteLink(latestInvitation.token))}
                    size="sm"
                    type="button"
                  >
                    <Copy className="size-4" />
                    Salin Link
                  </Button>
                </div>
              ) : null}
            </SettingsSectionCard>

            <SettingsSectionCard
              description="Link undangan manual yang belum diterima anggota."
              title="Undangan Menunggu"
            >
              <WorkspaceInvitationList
                actionDisabled={actionPending}
                invitations={pendingInvitations}
                onCancel={handleCancelInvitation}
                onCopy={(link) => void handleCopyLink(link)}
              />
            </SettingsSectionCard>

            <SettingsSectionCard
              description="Anggota aktif dan anggota yang sudah dihapus. Undangan lama tanpa link tidak ditampilkan."
              title="Daftar Anggota"
            >
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="size-4" />
                <span>{members.length} data anggota</span>
              </div>
              <WorkspaceMemberList
                actionDisabled={actionPending}
                canManage={manageable}
                currentUserEmail={user.email ?? null}
                currentUserId={user.id}
                members={members}
                onAccept={() => undefined}
                onRemove={handleRemove}
                onRoleChange={handleRoleChange}
              />
            </SettingsSectionCard>
          </div>
        ) : null}
      </section>
    </main>
  );
}
