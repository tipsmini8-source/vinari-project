import { Copy, X } from 'lucide-react';

import type { WorkspaceInvitation, WorkspaceMemberRole } from '@features/settings/types/settings.types';
import { Button } from '@shared/ui/button';

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
});

const roleLabels: Record<WorkspaceMemberRole, string> = {
  member: 'Anggota',
  owner: 'Pemilik',
  partner: 'Partner',
  viewer: 'Lihat saja'
};

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function getInviteLink(token: string) {
  return `${window.location.origin}/invite/${token}`;
}

export function WorkspaceInvitationList({
  actionDisabled,
  invitations,
  onCancel,
  onCopy
}: {
  actionDisabled?: boolean;
  invitations: WorkspaceInvitation[];
  onCancel: (invitation: WorkspaceInvitation) => void;
  onCopy: (link: string) => void;
}) {
  if (invitations.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
        Belum ada undangan yang menunggu.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {invitations.map((invitation) => {
        const link = getInviteLink(invitation.token);

        return (
          <article className="rounded-md border border-border bg-background p-4" key={invitation.id}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="break-all font-semibold">{invitation.email}</h3>
                  <span className="rounded-full border border-warning/30 bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
                    Menunggu
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-primary/20 bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
                    {roleLabels[invitation.role]}
                  </span>
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                    Kedaluwarsa {formatDate(invitation.expires_at)}
                  </span>
                </div>
                <p className="mt-3 break-all rounded-md border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
                  {link}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 lg:w-56 lg:justify-end">
                <Button disabled={actionDisabled} onClick={() => onCopy(link)} size="sm" type="button" variant="outline">
                  <Copy className="size-4" />
                  Salin Link
                </Button>
                <Button
                  className="text-destructive hover:text-destructive"
                  disabled={actionDisabled}
                  onClick={() => onCancel(invitation)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <X className="size-4" />
                  Batalkan
                </Button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
