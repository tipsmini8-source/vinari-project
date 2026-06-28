import { Check, Trash2 } from 'lucide-react';

import type { WorkspaceMember, WorkspaceMemberRole } from '@features/settings/types/settings.types';
import { Button } from '@shared/ui/button';

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
});

const roleOptions: WorkspaceMemberRole[] = ['owner', 'partner', 'member', 'viewer'];

const roleLabels: Record<WorkspaceMemberRole, string> = {
  member: 'Anggota',
  owner: 'Pemilik',
  partner: 'Partner',
  viewer: 'Lihat saja'
};

const statusLabels: Record<WorkspaceMember['status'], string> = {
  active: 'Aktif',
  invited: 'Diundang',
  removed: 'Dihapus'
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return '-';
  }

  return dateFormatter.format(new Date(value));
}

function statusClassName(status: WorkspaceMember['status']) {
  if (status === 'active') {
    return 'border-success/20 bg-success/10 text-success';
  }

  if (status === 'invited') {
    return 'border-warning/30 bg-warning/15 text-warning';
  }

  return 'border-muted bg-muted text-muted-foreground';
}

function roleOptionsFor(member: WorkspaceMember) {
  if (member.role === 'viewer') {
    return roleOptions.filter((role) => role !== 'owner');
  }

  return roleOptions;
}

function memberDisplayName(member: WorkspaceMember) {
  return member.profile?.full_name || member.invite_email || 'Anggota ruang keuangan';
}

export function WorkspaceMemberList({
  actionDisabled,
  canManage,
  currentUserEmail,
  currentUserId,
  members,
  onAccept,
  onRemove,
  onRoleChange
}: {
  actionDisabled?: boolean;
  canManage: boolean;
  currentUserEmail: string | null;
  currentUserId: string | undefined;
  members: WorkspaceMember[];
  onAccept: (member: WorkspaceMember) => void;
  onRemove: (member: WorkspaceMember) => void;
  onRoleChange: (member: WorkspaceMember, role: WorkspaceMemberRole) => void;
}) {
  if (members.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
        Belum ada anggota di ruang keuangan ini.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {members.map((member) => {
        const isInvitationForCurrentUser =
          member.status === 'invited' &&
          Boolean(currentUserEmail) &&
          member.invite_email?.toLowerCase() === currentUserEmail?.toLowerCase();
        const joinedAt = member.status === 'invited' ? member.invited_at : member.accepted_at ?? member.created_at;
        const canEditRow = canManage && member.status !== 'removed';

        return (
          <article className="rounded-md border border-border bg-background p-4" key={member.id}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-semibold">{memberDisplayName(member)}</h3>
                  {member.user_id === currentUserId ? (
                    <span className="rounded-full border border-primary/20 bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
                      Anda
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {member.status === 'invited'
                    ? member.invite_email
                    : member.invite_email ?? 'Akun sudah bergabung'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-primary/20 bg-primary-soft px-2 py-0.5 text-xs font-medium capitalize text-primary">
                    {roleLabels[member.role]}
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusClassName(member.status)}`}>
                    {statusLabels[member.status]}
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {member.status === 'invited' ? 'Diundang' : 'Bergabung'} {formatDate(joinedAt)}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:w-56">
                {canEditRow ? (
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70"
                    disabled={actionDisabled}
                    onChange={(event) => onRoleChange(member, event.target.value as WorkspaceMemberRole)}
                    value={member.role}
                  >
                    {roleOptionsFor(member).map((role) => (
                      <option key={role} value={role}>
                        {roleLabels[role]}
                      </option>
                    ))}
                  </select>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {isInvitationForCurrentUser ? (
                    <Button disabled={actionDisabled} onClick={() => onAccept(member)} size="sm" type="button">
                      <Check className="size-4" />
                      Terima
                    </Button>
                  ) : null}

                  {canEditRow ? (
                    <Button
                      className="text-destructive hover:text-destructive"
                      disabled={actionDisabled}
                      onClick={() => onRemove(member)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Trash2 className="size-4" />
                      Hapus
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
