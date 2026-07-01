import { AlertCircle, CheckCircle2, Loader2, LogIn, UserPlus } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { useAuth } from '@features/auth';
import {
  useAcceptWorkspaceInvitationByToken,
  useInvitationByToken
} from '@features/settings/hooks/useSettings';
import type { WorkspaceMemberRole } from '@features/settings/types/settings.types';
import { Button } from '@shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
});

const roleLabels: Record<WorkspaceMemberRole, string> = {
  member: 'Anggota',
  owner: 'Pemilik',
  partner: 'Partner',
  viewer: 'Lihat saja'
};

function statusMessage(status: string) {
  if (status === 'expired') {
    return 'Undangan sudah kedaluwarsa.';
  }

  if (status === 'accepted') {
    return 'Undangan sudah diterima.';
  }

  if (status === 'cancelled') {
    return 'Undangan tidak ditemukan.';
  }

  return null;
}

export function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { loading: authLoading, user } = useAuth();
  const { refreshWorkspace } = useWorkspace();
  const { toast } = useToast();
  const invitationQuery = useInvitationByToken(token);
  const acceptInvitation = useAcceptWorkspaceInvitationByToken();

  const invitation = invitationQuery.data ?? null;
  const normalizedUserEmail = user?.email?.trim().toLowerCase() ?? null;
  const emailMatches = Boolean(invitation && normalizedUserEmail === invitation.email.toLowerCase());
  const blockedMessage = invitation ? statusMessage(invitation.status) : null;

  const handleAccept = async () => {
    if (!token) {
      return;
    }

    try {
      await acceptInvitation.mutateAsync(token);
      await refreshWorkspace();
      toast({ title: 'Undangan berhasil diterima.' });
      void navigate('/app', { replace: true });
    } catch (error) {
      toast({
        title: 'Gagal menerima undangan',
        description: error instanceof Error ? error.message : 'Gagal menerima undangan. Coba lagi.',
        variant: 'destructive'
      });
    }
  };

  if (authLoading || invitationQuery.isLoading) {
    return <GlobalLoading />;
  }

  return (
    <main className="min-h-svh bg-background px-4 py-10 text-foreground">
      <section className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <Link className="text-sm font-medium text-primary hover:underline" to="/">
          Vinari
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Undangan Workspace</CardTitle>
            <CardDescription>Gunakan email yang sama dengan undangan.</CardDescription>
          </CardHeader>
          <CardContent>
            {invitationQuery.isError ? (
              <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-4">
                <AlertCircle className="mt-0.5 size-5 text-destructive" />
                <p className="text-sm text-muted-foreground">Undangan tidak ditemukan.</p>
              </div>
            ) : null}

            {!invitationQuery.isError && !invitation ? (
              <div className="flex items-start gap-3 rounded-md border border-border bg-secondary/30 p-4">
                <AlertCircle className="mt-0.5 size-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Undangan tidak ditemukan.</p>
              </div>
            ) : null}

            {invitation ? (
              <div className="space-y-5">
                <div className="rounded-md border border-border bg-secondary/30 p-4">
                  <p className="text-sm text-muted-foreground">Workspace</p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-normal">{invitation.workspace_name}</h1>
                  <div className="mt-4 grid gap-2 text-sm">
                    <p>
                      <span className="font-medium">Email undangan:</span> {invitation.email}
                    </p>
                    <p>
                      <span className="font-medium">Role:</span> {roleLabels[invitation.role]}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span> {invitation.status}
                    </p>
                    <p>
                      <span className="font-medium">Kedaluwarsa:</span>{' '}
                      {dateFormatter.format(new Date(invitation.expires_at))}
                    </p>
                  </div>
                </div>

                {blockedMessage ? (
                  <div className="flex items-start gap-3 rounded-md border border-warning/30 bg-warning/15 p-4">
                    <AlertCircle className="mt-0.5 size-5 text-warning" />
                    <p className="text-sm text-muted-foreground">{blockedMessage}</p>
                  </div>
                ) : null}

                {!blockedMessage && !user ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button asChild>
                      <Link to={`/login?invite=${token ?? ''}`}>
                        <LogIn className="size-4" />
                        Masuk untuk Terima
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to={`/register?invite=${token ?? ''}`}>
                        <UserPlus className="size-4" />
                        Daftar Akun
                      </Link>
                    </Button>
                  </div>
                ) : null}

                {!blockedMessage && user && !emailMatches ? (
                  <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-4">
                    <AlertCircle className="mt-0.5 size-5 text-destructive" />
                    <p className="text-sm text-muted-foreground">
                      Undangan ini ditujukan untuk {invitation.email}. Silakan masuk dengan email tersebut.
                    </p>
                  </div>
                ) : null}

                {!blockedMessage && user && emailMatches ? (
                  <Button disabled={acceptInvitation.isPending} onClick={() => void handleAccept()} type="button">
                    {acceptInvitation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    Terima Undangan
                  </Button>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
