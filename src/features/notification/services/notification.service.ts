import { supabase } from '@/lib/supabase';
import type { AppNotification, CreateNotificationInput, NotificationType } from '@features/notification/types/notification.types';

type SupabaseErrorLike = {
  message?: string;
};

const notificationSelect =
  'id, workspace_id, user_id, title, message, type, is_read, action_url, metadata, created_at';

function assertSupabaseSuccess(error: SupabaseErrorLike | null, fallbackMessage: string) {
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asOptionalString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function asNotificationType(value: unknown): NotificationType {
  if (value === 'success' || value === 'warning' || value === 'error') {
    return value;
  }

  return 'info';
}

function asMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function mapNotification(row: Record<string, unknown>): AppNotification {
  return {
    id: asString(row.id),
    workspace_id: asOptionalString(row.workspace_id),
    user_id: asOptionalString(row.user_id),
    title: asString(row.title),
    message: asString(row.message),
    type: asNotificationType(row.type),
    is_read: Boolean(row.is_read),
    action_url: asOptionalString(row.action_url),
    metadata: asMetadata(row.metadata),
    created_at: asString(row.created_at)
  };
}

function toPayload(input: CreateNotificationInput) {
  return {
    workspace_id: input.workspaceId,
    user_id: input.userId,
    title: input.title,
    message: input.message,
    type: input.type ?? 'info',
    action_url: input.actionUrl ?? null,
    metadata: input.metadata ?? {}
  };
}

export const NotificationService = {
  async getNotifications(userId: string): Promise<AppNotification[]> {
    const { data, error } = (await supabase
      .from('notifications')
      .select(notificationSelect)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })) as unknown as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil notifikasi.');

    return (data ?? []).map(mapNotification);
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    assertSupabaseSuccess(error, 'Gagal menghitung notifikasi unread.');

    return count ?? 0;
  },

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    assertSupabaseSuccess(error, 'Gagal menandai notifikasi sebagai read.');
  },

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    assertSupabaseSuccess(error, 'Gagal menandai semua notifikasi sebagai read.');
  },

  async createNotification(input: CreateNotificationInput): Promise<AppNotification> {
    const { data, error } = (await supabase
      .from('notifications')
      .insert(toPayload(input))
      .select(notificationSelect)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal membuat notifikasi.');

    if (!data) {
      throw new Error('Notifikasi tidak berhasil dibuat.');
    }

    return mapNotification(data);
  },

  async createBudgetOverBudgetNotification({
    budgetName,
    percentage,
    userId,
    workspaceId
  }: {
    budgetName: string;
    percentage: number;
    userId: string;
    workspaceId: string;
  }): Promise<AppNotification> {
    return this.createNotification({
      workspaceId,
      userId,
      title: 'Budget over budget',
      message: `Budget "${budgetName}" sudah mencapai ${percentage}% dari limit.`,
      type: 'warning',
      actionUrl: '/app/budgets',
      metadata: {
        budget_name: budgetName,
        percentage
      }
    });
  }
};
