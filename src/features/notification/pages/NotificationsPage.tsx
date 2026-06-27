import { ArrowLeft, Bell, CheckCheck } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router';

import { useAuth } from '@features/auth';
import { NotificationList } from '@features/notification/components/NotificationList';
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications
} from '@features/notification/hooks/useNotifications';
import type { AppNotification } from '@features/notification/types/notification.types';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

function NotificationSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="rounded-md border border-border bg-card p-5 shadow-sm" key={index}>
          <div className="h-4 w-44 animate-pulse rounded bg-secondary" />
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-secondary" />
          <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-secondary" />
          <div className="mt-5 h-8 w-28 animate-pulse rounded bg-secondary" />
        </div>
      ))}
    </div>
  );
}

function NotificationErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-md border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex items-start gap-3">
        <Bell className="mt-0.5 size-5 text-destructive" />
        <div>
          <h2 className="font-semibold">Notifikasi gagal dimuat</h2>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          <Button className="mt-4" onClick={onRetry} type="button" variant="outline">
            Coba lagi
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NotificationsPage() {
  const { loading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const notificationsQuery = useNotifications(user?.id);
  const markAsRead = useMarkNotificationAsRead(user?.id);
  const markAllAsRead = useMarkAllNotificationsAsRead(user?.id);

  if (loading) {
    return <GlobalLoading />;
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((notification) => !notification.is_read).length;
  const isActionPending = markAsRead.isPending || markAllAsRead.isPending;

  const handleRead = async (notification: AppNotification) => {
    if (notification.is_read) {
      return;
    }

    try {
      await markAsRead.mutateAsync(notification.id);
      toast({ title: 'Notifikasi ditandai read' });
    } catch (error) {
      toast({
        title: 'Gagal menandai notifikasi',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const handleOpen = async (notification: AppNotification) => {
    if (!notification.is_read) {
      try {
        await markAsRead.mutateAsync(notification.id);
      } catch (error) {
        toast({
          title: 'Gagal menandai notifikasi',
          description: error instanceof Error ? error.message : 'Silakan coba lagi.',
          variant: 'destructive'
        });
        return;
      }
    }

    if (notification.action_url) {
      void navigate(notification.action_url);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead.mutateAsync();
      toast({ title: 'Semua notifikasi ditandai read' });
    } catch (error) {
      toast({
        title: 'Gagal menandai semua notifikasi',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  return (
    <main className="min-h-svh bg-background px-4 py-8 text-foreground">
      <section className="mx-auto w-full max-w-4xl">
        <div className="mb-6">
          <Button asChild className="mb-4" size="sm" variant="ghost">
            <Link to="/app">
              <ArrowLeft className="size-4" />
              Kembali
            </Link>
          </Button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Notification Center</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-normal">Notifikasi</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Lihat informasi internal aplikasi dan status aktivitas penting.
              </p>
            </div>

            <Button disabled={unreadCount === 0 || isActionPending} onClick={handleMarkAll} type="button" variant="outline">
              <CheckCheck className="size-4" />
              Mark all read
            </Button>
          </div>
        </div>

        <div className="mb-4 rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Bell className="size-5 text-primary" />
              <div>
                <p className="font-semibold">{unreadCount} unread</p>
                <p className="text-sm text-muted-foreground">{notifications.length} total notifikasi</p>
              </div>
            </div>
          </div>
        </div>

        {notificationsQuery.isLoading ? <NotificationSkeleton /> : null}

        {notificationsQuery.isError ? (
          <NotificationErrorState
            message={notificationsQuery.error instanceof Error ? notificationsQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void notificationsQuery.refetch()}
          />
        ) : null}

        {!notificationsQuery.isLoading && !notificationsQuery.isError ? (
          <NotificationList
            isActionPending={isActionPending}
            notifications={notifications}
            onOpen={handleOpen}
            onRead={handleRead}
          />
        ) : null}
      </section>
    </main>
  );
}
