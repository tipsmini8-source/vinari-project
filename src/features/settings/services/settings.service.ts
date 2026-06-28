import { supabase } from '@/lib/supabase';
import type {
  MemberInviteSubmitInput,
  PreferencesSubmitInput,
  ProfileSubmitInput,
  UserPreferences,
  UserProfile,
  WorkspaceMember,
  WorkspaceMemberProfile,
  WorkspaceMemberRole,
  WorkspaceMemberStatus,
  WorkspaceSettings,
  WorkspaceSettingsSubmitInput
} from '@features/settings/types/settings.types';
import { getAppTemplate, type AppTemplateId } from '@shared/theme/app-templates';

type SupabaseErrorLike = {
  message?: string;
};

const workspaceMemberSelect =
  'id, workspace_id, user_id, invite_email, role, status, invited_at, accepted_at, created_at, profile:profiles!workspace_members_user_id_fkey(id, full_name, avatar_url)';

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

function asNumberOrNull(value: unknown) {
  return typeof value === 'number' ? value : null;
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

function asAppTemplate(value: unknown): AppTemplateId {
  return getAppTemplate(value).id;
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
      app_template: 'tech_premium',
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
    app_template: asAppTemplate(row.app_template),
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

function asWorkspaceMemberRole(value: unknown): WorkspaceMemberRole {
  if (value === 'owner' || value === 'partner' || value === 'member' || value === 'viewer') {
    return value;
  }

  return 'viewer';
}

function asWorkspaceMemberStatus(value: unknown): WorkspaceMemberStatus {
  if (value === 'active' || value === 'invited' || value === 'removed') {
    return value;
  }

  return 'active';
}

function normalizeRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function mapWorkspaceMember(row: Record<string, unknown>): WorkspaceMember {
  const profile = normalizeRelation(row.profile as WorkspaceMemberProfile | WorkspaceMemberProfile[] | null);

  return {
    id: asString(row.id),
    workspace_id: asString(row.workspace_id),
    user_id: asOptionalString(row.user_id),
    invite_email: asOptionalString(row.invite_email),
    role: asWorkspaceMemberRole(row.role),
    status: asWorkspaceMemberStatus(row.status),
    invited_at: asOptionalString(row.invited_at),
    accepted_at: asOptionalString(row.accepted_at),
    created_at: asString(row.created_at),
    profile: profile
      ? {
          full_name: asOptionalString(profile.full_name),
          avatar_url: asOptionalString(profile.avatar_url)
        }
      : null
  };
}

async function getWorkspaceMember(workspaceId: string, memberId: string): Promise<WorkspaceMember> {
  const { data, error } = (await supabase
    .from('workspace_members')
    .select(workspaceMemberSelect)
    .eq('workspace_id', workspaceId)
    .eq('id', memberId)
    .is('deleted_at', null)
    .single()) as unknown as {
    data: Record<string, unknown> | null;
    error: SupabaseErrorLike | null;
  };

  assertSupabaseSuccess(error, 'Gagal mengambil member workspace.');

  if (!data) {
    throw new Error('Member workspace tidak ditemukan.');
  }

  return mapWorkspaceMember(data);
}

async function getOwnerCount(workspaceId: string): Promise<number> {
  const { count, error } = await supabase
    .from('workspace_members')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .eq('role', 'owner')
    .eq('status', 'active')
    .is('deleted_at', null);

  assertSupabaseSuccess(error, 'Gagal menghitung owner workspace.');

  return count ?? 0;
}

async function assertMemberLimitAvailable(workspaceId: string) {
  const { count, error: countError } = await supabase
    .from('workspace_members')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .in('status', ['active', 'invited'])
    .is('deleted_at', null);

  assertSupabaseSuccess(countError, 'Gagal mengecek limit member.');

  const { data: subscription, error: subscriptionError } = (await supabase
    .from('workspace_subscriptions')
    .select('plan_code')
    .eq('workspace_id', workspaceId)
    .eq('status', 'active')
    .maybeSingle()) as unknown as {
    data: Record<string, unknown> | null;
    error: SupabaseErrorLike | null;
  };

  assertSupabaseSuccess(subscriptionError, 'Gagal mengambil subscription workspace.');

  const planCode = asString(subscription?.plan_code, 'free');
  const { data: plan, error: planError } = (await supabase
    .from('plans')
    .select('max_members')
    .eq('code', planCode)
    .maybeSingle()) as unknown as {
    data: Record<string, unknown> | null;
    error: SupabaseErrorLike | null;
  };

  assertSupabaseSuccess(planError, 'Gagal mengambil plan workspace.');

  const maxMembers = plan ? asNumberOrNull(plan.max_members) : 1;

  if (maxMembers !== null && (count ?? 0) >= maxMembers) {
    throw new Error('Limit member plan sudah tercapai. Upgrade ke Premium Family untuk menambah anggota.');
  }
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
      .select('id, user_id, theme, language, currency_code, date_format, first_day_of_week, email_notification, push_notification, app_template')
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
      app_template: input.appTemplate,
      notification_enabled: input.emailNotification || input.pushNotification,
      metadata: {}
    };

    const { data, error } = (await supabase
      .from('user_preferences')
      .upsert(payload, { onConflict: 'user_id' })
      .select('id, user_id, theme, language, currency_code, date_format, first_day_of_week, email_notification, push_notification, app_template')
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal menyimpan preferensi.');

    return mapPreferences(data, userId);
  },

  async updateAppTemplate(userId: string, templateId: AppTemplateId): Promise<UserPreferences> {
    const payload = {
      user_id: userId,
      app_template: getAppTemplate(templateId).id,
      metadata: {}
    };

    const { data, error } = (await supabase
      .from('user_preferences')
      .upsert(payload, { onConflict: 'user_id' })
      .select('id, user_id, theme, language, currency_code, date_format, first_day_of_week, email_notification, push_notification, app_template')
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal menyimpan template tampilan.');

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

  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const { data, error } = (await supabase
      .from('workspace_members')
      .select(workspaceMemberSelect)
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })) as unknown as {
      data: Record<string, unknown>[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil anggota workspace.');

    return (data ?? []).map(mapWorkspaceMember);
  },

  async getWorkspaceInvitations(email: string): Promise<WorkspaceMember[]> {
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = (await supabase
      .from('workspace_members')
      .select(workspaceMemberSelect)
      .eq('invite_email', normalizedEmail)
      .eq('status', 'invited')
      .is('deleted_at', null)
      .order('invited_at', { ascending: false })) as unknown as {
      data: Record<string, unknown>[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil undangan workspace.');

    return (data ?? []).map(mapWorkspaceMember);
  },

  async inviteWorkspaceMember(workspaceId: string, input: MemberInviteSubmitInput): Promise<WorkspaceMember> {
    await assertMemberLimitAvailable(workspaceId);

    const normalizedEmail = input.email.trim().toLowerCase();

    const { data, error } = (await supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspaceId,
        user_id: null,
        invite_email: normalizedEmail,
        role: input.role,
        status: 'invited',
        invited_at: new Date().toISOString(),
        metadata: {}
      })
      .select(workspaceMemberSelect)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengirim undangan member.');

    if (!data) {
      throw new Error('Undangan member tidak berhasil dibuat.');
    }

    return mapWorkspaceMember(data);
  },

  async updateWorkspaceMemberRole(
    workspaceId: string,
    memberId: string,
    currentUserId: string,
    role: WorkspaceMemberRole
  ): Promise<WorkspaceMember> {
    const member = await getWorkspaceMember(workspaceId, memberId);

    if (member.role === 'viewer' && role === 'owner') {
      throw new Error('Viewer tidak bisa langsung dijadikan owner.');
    }

    if (member.user_id === currentUserId && member.role === 'owner' && role !== 'owner') {
      const ownerCount = await getOwnerCount(workspaceId);

      if (ownerCount <= 1) {
        throw new Error('Owner terakhir tidak bisa menurunkan role dirinya sendiri.');
      }
    }

    const { data, error } = (await supabase
      .from('workspace_members')
      .update({
        role,
        updated_by: currentUserId
      })
      .eq('workspace_id', workspaceId)
      .eq('id', memberId)
      .select(workspaceMemberSelect)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengubah role member.');

    if (!data) {
      throw new Error('Member workspace tidak ditemukan.');
    }

    return mapWorkspaceMember(data);
  },

  async removeWorkspaceMember(workspaceId: string, memberId: string, currentUserId: string): Promise<void> {
    const member = await getWorkspaceMember(workspaceId, memberId);

    if (member.user_id === currentUserId && member.role === 'owner') {
      const ownerCount = await getOwnerCount(workspaceId);

      if (ownerCount <= 1) {
        throw new Error('Owner terakhir tidak bisa remove dirinya sendiri.');
      }
    }

    const { error } = await supabase
      .from('workspace_members')
      .update({
        status: 'removed',
        updated_by: currentUserId
      })
      .eq('workspace_id', workspaceId)
      .eq('id', memberId);

    assertSupabaseSuccess(error, 'Gagal remove member workspace.');
  },

  async acceptWorkspaceInvitation(invitationId: string): Promise<void> {
    const { error } = await supabase.rpc('accept_workspace_invitation', {
      invitation_uuid: invitationId
    });

    assertSupabaseSuccess(error, 'Gagal menerima undangan workspace.');
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
