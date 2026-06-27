import { ArrowLeft, Bell, Briefcase, CreditCard, LogOut, Palette, Shield, User, Users } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { useAuth } from '@features/auth';
import { useSettingsLogout } from '@features/settings/hooks/useSettings';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

const settingsMenu = [
  {
    description: 'Nama, avatar, timezone, locale, dan currency.',
    href: '/app/settings/profile',
    icon: User,
    title: 'Profil'
  },
  {
    description: 'Theme, bahasa, format tanggal, dan notifikasi.',
    href: '/app/settings/preferences',
    icon: Palette,
    title: 'Preferensi'
  },
  {
    description: 'Info workspace aktif, role, dan member.',
    href: '/app/settings/workspace',
    icon: Briefcase,
    title: 'Workspace'
  },
  {
    description: 'Invite, role, status, dan akses anggota workspace.',
    href: '/app/settings/members',
    icon: Users,
    title: 'Anggota'
  },
  {
    description: 'Email akun, reset password, dan sesi login.',
    href: '/app/settings/security',
    icon: Shield,
    title: 'Keamanan'
  },
  {
    description: 'Plan aktif, subscription, dan payment request.',
    href: '/app/billing',
    icon: CreditCard,
    title: 'Billing'
  }
];

export function SettingsHomePage() {
  const { user } = useAuth();
  const { loading, workspace } = useWorkspace();
  const logout = useSettingsLogout();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      void navigate('/login', { replace: true });
    } catch (error) {
      toast({
        title: 'Gagal logout',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  return (
    <main className="min-h-svh bg-background px-4 py-8 text-foreground">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-6">
          <Button asChild className="mb-3" size="sm" variant="ghost">
            <Link to="/app">
              <ArrowLeft className="size-4" />
              Kembali
            </Link>
          </Button>
          <p className="text-sm font-medium text-primary">{workspace.name}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">Settings</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Kelola profil, preferensi aplikasi, workspace, dan keamanan akun.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {settingsMenu.map((item) => (
            <Link
              className="rounded-md border border-border bg-card p-5 text-card-foreground shadow-sm transition-colors hover:border-primary"
              key={item.href}
              to={item.href}
            >
              <div className="flex items-start gap-3">
                <item.icon className="mt-0.5 size-5 text-primary" />
                <div>
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}

          <button
            className="rounded-md border border-border bg-card p-5 text-left text-card-foreground shadow-sm transition-colors hover:border-destructive"
            disabled={logout.isPending}
            onClick={handleLogout}
            type="button"
          >
            <div className="flex items-start gap-3">
              <LogOut className="mt-0.5 size-5 text-destructive" />
              <div>
                <h2 className="font-semibold">Logout</h2>
                <p className="mt-1 text-sm text-muted-foreground">Keluar dari sesi Vinari saat ini.</p>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-4 rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="flex items-start gap-3">
            <Bell className="mt-0.5 size-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              Perubahan preferensi tersimpan di akun dan dapat digunakan oleh modul Vinari lain.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
