import { ArrowLeft, Lock, Users } from 'lucide-react';
import { Link, Navigate } from 'react-router';

import { canManageMembers, useWorkspace } from '@/core/workspace';
import { useAuth } from '@features/auth';
import { usePlan } from '@features/premium';
import { MemberInviteForm } from '@features/settings/components/MemberInviteForm';
import { SettingsErrorState, SettingsSectionCard, SettingsSkeleton } from '@features/settings/components/SettingsStates';
import { WorkspaceMemberList } from '@features/settings/components/WorkspaceMemberList';
import {
  useAcceptWorkspaceInvitation,
  useInviteWorkspaceMember,
  useRemoveWorkspaceMember,
  useUpdateWorkspaceMemberRole,
  useWorkspaceInvitations,
  useWorkspaceMembers
} from '@features/settings/hooks/useSettings';
import type {
  MemberInviteSubmitInput,
  WorkspaceMember,
  WorkspaceMemberRole
} from '@features/settings/types/settings.types';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

export function MembersSettingsPage() {
  const { user } = useAuth();
  const { loading, refreshWorkspace, workspace } = useWorkspace();
  const { toast } = useToast();
  const planQuery = usePlan();
  const membersQuery = useWorkspaceMembers(workspace?.id);
  const invitationsQuery = useWorkspaceInvitations(workspace ? undefined : user?.email);
  const inviteMember = useInviteWorkspaceMember(workspace?.id);
  const updateRole = useUpdateWorkspaceMemberRole(workspace?.id, user?.id);
  const removeMember = useRemoveWorkspaceMember(workspace?.id, user?.id);
  const acceptInvitation = useAcceptWorkspaceInvitation(workspace?.id);

  const handleAcceptInvitation = async (member: WorkspaceMember) => {
    try {
      await acceptInvitation.mutateAsync(member.id);
      await refreshWorkspace();
      toast({ title: 'Undangan diterima' });
    } catch (error) {
      toast({
        title: 'Gagal menerima undangan',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
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
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Undangan Workspace</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Terima undangan workspace yang dikirim ke email akun ini.
            </p>
          </div>

          {invitationsQuery.isLoading ? <SettingsSkeleton /> : null}

          {invitationsQuery.isError ? (
            <SettingsErrorState
              message={invitationsQuery.error instanceof Error ? invitationsQuery.error.message : 'Terjadi kesalahan.'}
              onRetry={() => void invitationsQuery.refetch()}
            />
          ) : null}

          {!invitationsQuery.isLoading && !invitationsQuery.isError ? (
            <SettingsSectionCard
              description="Jika email akun cocok dengan undangan, Anda bisa menerima akses workspace."
              title="Undangan Saya"
            >
              <WorkspaceMemberList
                actionDisabled={acceptInvitation.isPending}
                canManage={false}
                currentUserEmail={user.email ?? null}
                currentUserId={user.id}
                members={invitationsQuery.data ?? []}
                onAccept={handleAcceptInvitation}
                onRemove={() => undefined}
                onRoleChange={() => undefined}
              />
            </SettingsSectionCard>
          ) : null}
        </section>
      </main>
    );
  }

  const members = membersQuery.data ?? [];
  const manageable = canManageMembers(workspace.role);
  const maxMembers = planQuery.activePlan?.max_members ?? 1;
  const memberCount = members.filter((member) => member.status === 'active' || member.status === 'invited').length;
  const memberLimitReached = maxMembers !== null && memberCount >= maxMembers;
  const familyLocked = !planQuery.hasFeature('family_workspace');
  const actionPending =
    inviteMember.isPending || updateRole.isPending || removeMember.isPending || acceptInvitation.isPending;

  const handleInvite = async (input: MemberInviteSubmitInput) => {
    try {
      await inviteMember.mutateAsync(input);
      toast({ title: 'Undangan dikirim' });
    } catch (error) {
      toast({
        title: 'Gagal mengirim undangan',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const handleRoleChange = async (member: WorkspaceMember, role: WorkspaceMemberRole) => {
    if (member.role === role) {
      return;
    }

    try {
      await updateRole.mutateAsync({ memberId: member.id, role });
      await refreshWorkspace();
      toast({ title: 'Role member diperbarui' });
    } catch (error) {
      toast({
        title: 'Gagal mengubah role',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const handleRemove = async (member: WorkspaceMember) => {
    const confirmed = window.confirm(`Remove member "${member.profile?.full_name || member.invite_email || member.id}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await removeMember.mutateAsync(member.id);
      await refreshWorkspace();
      toast({ title: 'Member diremove' });
    } catch (error) {
      toast({
        title: 'Gagal remove member',
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
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">Anggota Workspace</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Kelola anggota keluarga atau tim yang bisa mengakses workspace aktif.
          </p>
        </div>

        {membersQuery.isLoading || planQuery.isLoading ? <SettingsSkeleton /> : null}

        {membersQuery.isError ? (
          <SettingsErrorState
            message={membersQuery.error instanceof Error ? membersQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void membersQuery.refetch()}
          />
        ) : null}

        {!membersQuery.isLoading && !membersQuery.isError ? (
          <div className="space-y-4">
            <SettingsSectionCard
              description={`${memberCount}/${maxMembers ?? 'Unlimited'} slot member terpakai.`}
              title="Invite Member"
            >
              {!manageable ? (
                <div className="rounded-md border border-border bg-background p-4 text-sm text-muted-foreground">
                  Hanya owner workspace yang bisa mengundang dan mengelola anggota.
                </div>
              ) : null}

              {manageable && memberLimitReached ? (
                <div className="rounded-md border border-warning/30 bg-warning/15 p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 size-5 text-warning" />
                    <div>
                      <h2 className="font-semibold text-warning">Limit member tercapai</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Plan saat ini membatasi workspace ke {maxMembers} member. Upgrade ke Premium Family untuk
                        menambah hingga 5 member.
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
                  isSubmitting={inviteMember.isPending}
                  onSubmit={handleInvite}
                />
              ) : null}
            </SettingsSectionCard>

            <SettingsSectionCard
              description="Anggota aktif, undangan yang belum diterima, dan member yang sudah diremove."
              title="Daftar Anggota"
            >
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="size-4" />
                <span>{members.length} record member</span>
              </div>
              <WorkspaceMemberList
                actionDisabled={actionPending}
                canManage={manageable}
                currentUserEmail={user.email ?? null}
                currentUserId={user.id}
                members={members}
                onAccept={handleAcceptInvitation}
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
