import { ArrowLeft, LogOut, Mail, Shield } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { useAuth } from '@features/auth';
import { SettingsSectionCard } from '@features/settings/components/SettingsStates';
import { useLogoutAllSessions, useRequestPasswordReset } from '@features/settings/hooks/useSettings';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

export function SecuritySettingsPage() {
  const { user } = useAuth();
  const { loading, workspace } = useWorkspace();
  const navigate = useNavigate();
  const { toast } = useToast();
  const requestPasswordReset = useRequestPasswordReset();
  const logoutAllSessions = useLogoutAllSessions();

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  const email = user.email ?? '';

  const handleResetPassword = async () => {
    if (!email) {
      return;
    }

    try {
      await requestPasswordReset.mutateAsync(email);
      toast({ title: 'Email reset password dikirim' });
    } catch (error) {
      toast({
        title: 'Gagal mengirim reset password',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const handleLogoutAll = async () => {
    const confirmed = window.confirm('Logout dari semua sesi? Anda akan diarahkan ke login.');

    if (!confirmed) {
      return;
    }

    try {
      await logoutAllSessions.mutateAsync();
      void navigate('/login', { replace: true });
    } catch (error) {
      toast({
        title: 'Gagal logout semua sesi',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  return (
    <main className="min-h-svh bg-background px-4 py-8 text-foreground">
      <section className="mx-auto w-full max-w-3xl">
        <Button asChild className="mb-4" size="sm" variant="ghost">
          <Link to="/app/settings">
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>

        <div className="space-y-4">
          <SettingsSectionCard
            description="Informasi login akun Vinari."
            title="Akun"
          >
            <div className="flex items-center gap-3 rounded-md border border-border p-3">
              <Mail className="size-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Email akun</p>
                <p className="font-medium">{email}</p>
              </div>
            </div>
          </SettingsSectionCard>

          <SettingsSectionCard
            description="Kelola akses login dan reset password."
            title="Keamanan"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                disabled={requestPasswordReset.isPending}
                onClick={handleResetPassword}
                type="button"
                variant="outline"
              >
                <Shield className="size-4" />
                Reset Password
              </Button>
              <Button
                disabled={logoutAllSessions.isPending}
                onClick={handleLogoutAll}
                type="button"
                variant="outline"
              >
                <LogOut className="size-4" />
                Logout Semua Sesi
              </Button>
            </div>
          </SettingsSectionCard>
        </div>
      </section>
    </main>
  );
}
