import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { NotificationService } from '@features/notification/services/notification.service';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (userId: string | undefined) => ['notifications', 'list', userId] as const,
  unreadCount: (userId: string | undefined) => ['notifications', 'unread-count', userId] as const
};

async function invalidateNotifications(queryClient: ReturnType<typeof useQueryClient>, userId: string | undefined) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: notificationKeys.list(userId) }),
    queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(userId) })
  ]);
}

export function useNotifications(userId: string | undefined) {
  return useQuery({
    enabled: Boolean(userId),
    queryKey: notificationKeys.list(userId),
    queryFn: () => {
      if (!userId) {
        throw new Error('User aktif tidak ditemukan.');
      }

      return NotificationService.getNotifications(userId);
    }
  });
}

export function useUnreadNotificationCount(userId: string | undefined) {
  return useQuery({
    enabled: Boolean(userId),
    queryKey: notificationKeys.unreadCount(userId),
    queryFn: () => {
      if (!userId) {
        throw new Error('User aktif tidak ditemukan.');
      }

      return NotificationService.getUnreadCount(userId);
    },
    refetchInterval: 60_000
  });
}

export function useMarkNotificationAsRead(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => {
      if (!userId) {
        throw new Error('User aktif tidak ditemukan.');
      }

      return NotificationService.markAsRead(notificationId, userId);
    },
    onSuccess: async () => {
      await invalidateNotifications(queryClient, userId);
    }
  });
}

export function useMarkAllNotificationsAsRead(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!userId) {
        throw new Error('User aktif tidak ditemukan.');
      }

      return NotificationService.markAllAsRead(userId);
    },
    onSuccess: async () => {
      await invalidateNotifications(queryClient, userId);
    }
  });
}
