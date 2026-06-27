import { Bell } from 'lucide-react';
import { Link } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { useAuth } from '@features/auth';
import { useUnreadNotificationCount } from '@features/notification';
import { Button } from '@shared/ui/button';
import { ThemeToggle } from '@shared/ui/theme-toggle';

export function AppHeader() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();
  const unreadQuery = useUnreadNotificationCount(user?.id);
  const unreadCount = unreadQuery.data ?? 0;

  return (
    <header className="fixed inset-x-0 top-0 z-20 h-16 border-b border-border bg-background/95 backdrop-blur lg:left-72">
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{workspace?.name ?? 'Vinari'}</p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              {workspace?.currency_code ?? 'IDR'} workspace
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
    </header>
  );
}
