import { Bell, Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { useAuth } from '@features/auth';
import { useUnreadNotificationCount } from '@features/notification';
import { ActionDialog } from '@shared/components/ActionDialog';
import { Button } from '@shared/ui/button';
import { ThemeToggle } from '@shared/ui/theme-toggle';

const roleLabels: Record<string, string> = {
  member: 'Member',
  owner: 'Owner',
  partner: 'Partner',
  viewer: 'Viewer'
};

export function AppHeader() {
  const [workspacePickerOpen, setWorkspacePickerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setActiveWorkspace, workspace, workspaces } = useWorkspace();
  const unreadQuery = useUnreadNotificationCount(user?.id);
  const unreadCount = unreadQuery.data ?? 0;

  const handleWorkspaceSelect = async (workspaceId: string) => {
    await setActiveWorkspace(workspaceId);
    setWorkspacePickerOpen(false);
    if (location.pathname !== '/app') {
      void navigate('/app');
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-20 h-16 border-b border-border bg-background/95 backdrop-blur lg:left-72">
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <button
              className="flex max-w-full items-center gap-1 rounded-md text-left text-sm font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setWorkspacePickerOpen(true)}
              type="button"
            >
              <span className="truncate">{workspace?.name ?? 'Vinari'}</span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            </button>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Ruang Keuangan {workspace?.currency_code ?? 'IDR'} - Beta
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button asChild size="icon" variant="ghost">
            <Link aria-label="Buka notifikasi" className="relative" to="/app/notifications">
              <Bell className="size-5" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-destructive-foreground">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : null}
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>

      <ActionDialog
        description="Pilih ruang yang ingin kamu kelola."
        onClose={() => setWorkspacePickerOpen(false)}
        open={workspacePickerOpen}
        title="Pilih Ruang Keuangan"
      >
        <div className="grid gap-2">
          {workspaces.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-5 text-sm text-muted-foreground">
              Belum ada ruang keuangan aktif.
            </div>
          ) : null}

          {workspaces.map((item) => {
            const active = item.id === workspace?.id;

            return (
              <button
                className="flex w-full items-center justify-between gap-3 rounded-md border border-border bg-background p-4 text-left transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                key={item.id}
                onClick={() => void handleWorkspaceSelect(item.id)}
                type="button"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{item.name}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {roleLabels[item.role] ?? item.role} - {item.currency_code}
                  </span>
                </span>
                {active ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/20 bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
                    <Check className="size-3" />
                    Aktif
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </ActionDialog>
    </header>
  );
}
