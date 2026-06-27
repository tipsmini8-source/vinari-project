import { supabase } from '@/lib/supabase';
import type {
  PreferencesSubmitInput,
  ProfileSubmitInput,
  UserPreferences,
  UserProfile,
  WorkspaceSettings,
  WorkspaceSettingsSubmitInput
} from '@features/settings/types/settings.types';

type SupabaseErrorLike = {
  message?: string;
};

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

function asTheme(value: unknown): UserPreferences['theme'] {
  if (value === 'light' || value === 'dark') {
    return value;
  }

  return 'system';
}

function asLanguage(value: unknown): UserPreferences['language'] {
  return value === 'en' ? 'en' : 'id';
}

function asFirstDayOfWeek(value: unknown): UserPreferences['first_day_of_week'] {
  return value === 'sunday' ? 'sunday' : 'monday';
}

function mapProfile(row: Record<string, unknown>): UserProfile {
  return {
    id: asString(row.id),
    full_name: asOptionalString(row.full_name),
    avatar_url: asOptionalString(row.avatar_url),
    timezone: asString(row.timezone, 'Asia/Jakarta'),
    locale: asString(row.locale, 'id-ID'),
    currency_code: asString(row.currency_code, 'IDR')
  };
}

function mapPreferences(row: Record<string, unknown> | null, userId: string): UserPreferences {
  if (!row) {
    return {
      id: null,
      user_id: userId,
      theme: 'system',
      language: 'id',
      currency_code: 'IDR',
      date_format: 'DD/MM/YYYY',
      first_day_of_week: 'monday',
      email_notification: true,
      push_notification: true
    };
  }

  return {
    id: asOptionalString(row.id),
    user_id: asString(row.user_id, userId),
    theme: asTheme(row.theme),
    language: asLanguage(row.language),
    currency_code: asString(row.currency_code, 'IDR'),
    date_format: asString(row.date_format, 'DD/MM/YYYY'),
    first_day_of_week: asFirstDayOfWeek(row.first_day_of_week),
    email_notification: Boolean(row.email_notification),
    push_notification: Boolean(row.push_notification)
  };
}

function workspaceTypeFromMetadata(metadata: unknown) {
  if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
    const workspaceType = (metadata as Record<string, unknown>).type;
    if (typeof workspaceType === 'string' && workspaceType.length > 0) {
      return workspaceType;
    }
  }

  return 'personal';
}

export const SettingsService = {
  async getProfile(userId: string): Promise<UserProfile> {
    const { data, error } = (await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, timezone, locale, currency_code')
      .eq('id', userId)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil profil.');

    if (!data) {
      throw new Error('Profil tidak ditemukan.');
    }

    return mapProfile(data);
  },

  async updateProfile(userId: string, input: ProfileSubmitInput): Promise<UserProfile> {
    const { data, error } = (await supabase
      .from('profiles')
      .update({
        full_name: input.fullName,
        avatar_url: input.avatarUrl || null,
        timezone: input.timezone,
        locale: input.locale,
        currency_code: input.currencyCode.toUpperCase()
      })
      .eq('id', userId)
      .select('id, full_name, avatar_url, timezone, locale, currency_code')
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal menyimpan profil.');

    if (!data) {
      throw new Error('Profil tidak ditemukan.');
    }

    return mapProfile(data);
  },

  async getPreferences(userId: string): Promise<UserPreferences> {
    const { data, error } = (await supabase
      .from('user_preferences')
      .select('id, user_id, theme, language, currency_code, date_format, first_day_of_week, email_notification, push_notification')
      .eq('user_id', userId)
      .maybeSingle()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil preferensi.');

    return mapPreferences(data, userId);
  },

  async updatePreferences(userId: string, input: PreferencesSubmitInput): Promise<UserPreferences> {
    const payload = {
      user_id: userId,
      theme: input.theme,
      language: input.language,
      currency_code: input.currencyCode.toUpperCase(),
      date_format: input.dateFormat,
      first_day_of_week: input.firstDayOfWeek,
      email_notification: input.emailNotification,
      push_notification: input.pushNotification,
      notification_enabled: input.emailNotification || input.pushNotification,
      metadata: {}
    };

    const { data, error } = (await supabase
      .from('user_preferences')
      .upsert(payload, { onConflict: 'user_id' })
      .select('id, user_id, theme, language, currency_code, date_format, first_day_of_week, email_notification, push_notification')
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal menyimpan preferensi.');

    return mapPreferences(data, userId);
  },

  async getWorkspaceSettings(workspaceId: string): Promise<WorkspaceSettings> {
    const { data: workspace, error: workspaceError } = (await supabase
      .from('workspaces')
      .select('id, name, currency_code, metadata')
      .eq('id', workspaceId)
      .is('deleted_at', null)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(workspaceError, 'Gagal mengambil workspace.');

    if (!workspace) {
      throw new Error('Workspace tidak ditemukan.');
    }

    const { count, error: memberError } = await supabase
      .from('workspace_members')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)
      .eq('status', 'active')
      .is('deleted_at', null);

    assertSupabaseSuccess(memberError, 'Gagal menghitung member workspace.');

    return {
      id: asString(workspace.id),
      name: asString(workspace.name),
      currency_code: asString(workspace.currency_code, 'IDR'),
      role: '',
      type: workspaceTypeFromMetadata(workspace.metadata),
      member_count: count ?? 0
    };
  },

  async updateWorkspaceName(workspaceId: string, input: WorkspaceSettingsSubmitInput): Promise<WorkspaceSettings> {
    const { data, error } = (await supabase
      .from('workspaces')
      .update({
        name: input.name
      })
      .eq('id', workspaceId)
      .select('id, name, currency_code, metadata')
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal menyimpan workspace.');

    if (!data) {
      throw new Error('Workspace tidak ditemukan.');
    }

    const workspace = await this.getWorkspaceSettings(workspaceId);

    return {
      ...workspace,
      name: asString(data.name, workspace.name)
    };
  },

  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    assertSupabaseSuccess(error, 'Gagal mengirim email reset password.');
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    assertSupabaseSuccess(error, 'Gagal logout.');
  },

  async logoutAllSessions(): Promise<void> {
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    assertSupabaseSuccess(error, 'Gagal logout semua sesi.');
  }
};
