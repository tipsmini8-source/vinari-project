export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type AppNotification = {
  id: string;
  workspace_id: string | null;
  user_id: string | null;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  action_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type CreateNotificationInput = {
  workspaceId: string;
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  actionUrl?: string | null;
  metadata?: Record<string, unknown>;
};
