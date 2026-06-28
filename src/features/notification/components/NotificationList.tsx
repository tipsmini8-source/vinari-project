import { Check, ExternalLink } from 'lucide-react';

import type { AppNotification, NotificationType } from '@features/notification/types/notification.types';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: 'short',
  year: 'numeric'
});

const typeClassName: Record<NotificationType, string> = {
  error: 'border-destructive/20 bg-destructive/10 text-destructive',
  info: 'border-primary/20 bg-primary-soft text-primary',
  success: 'border-success/20 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/15 text-warning'
};

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function NotificationList({
  isActionPending,
  notifications,
  onOpen,
  onRead
}: {
  isActionPending: boolean;
  notifications: AppNotification[];
  onOpen: (notification: AppNotification) => void;
  onRead: (notification: AppNotification) => void;
}) {
  if (notifications.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-card p-8 text-center text-card-foreground">
        <h2 className="font-semibold">Belum ada notifikasi</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Notifikasi internal Vinari akan muncul di sini.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {notifications.map((notification) => (
        <article
          className={cn(
            'rounded-md border bg-card p-4 text-card-foreground shadow-sm transition-colors',
            notification.is_read ? 'border-border' : 'border-primary/40 bg-primary-soft/60'
          )}
          key={notification.id}
        >
          <button
            className="block w-full text-left"
            disabled={isActionPending}
            onClick={() => onOpen(notification)}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{notification.title}</h2>
                  {!notification.is_read ? (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                      Unread
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{notification.message}</p>
              </div>
              {notification.action_url ? <ExternalLink className="mt-1 size-4 shrink-0 text-muted-foreground" /> : null}
            </div>
          </button>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('rounded-full border px-2 py-0.5 text-xs font-medium capitalize', typeClassName[notification.type])}>
                {notification.type}
              </span>
              <span className="text-xs text-muted-foreground">{formatDate(notification.created_at)}</span>
            </div>

            {!notification.is_read ? (
              <Button
                disabled={isActionPending}
                onClick={() => onRead(notification)}
                size="sm"
                type="button"
                variant="outline"
              >
                <Check className="size-4" />
                Tandai read
              </Button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
