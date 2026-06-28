import type {
  MemberInviteFormInput,
  PreferencesFormInput,
  ProfileFormInput,
  WorkspaceSettingsFormInput
} from '@features/settings/schemas/settings.schemas';
import type { AppTemplateId } from '@shared/theme/app-templates';

export type UserProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  timezone: string;
  locale: string;
  currency_code: string;
};

export type UserPreferences = {
  id: string | null;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: 'id' | 'en';
  currency_code: string;
  date_format: string;
  first_day_of_week: 'monday' | 'sunday';
  email_notification: boolean;
  app_template: AppTemplateId;
  push_notification: boolean;
};

export type WorkspaceSettings = {
  id: string;
  name: string;
  currency_code: string;
  role: string;
  type: string;
  member_count: number;
};

export type WorkspaceMemberRole = 'owner' | 'partner' | 'member' | 'viewer';
export type WorkspaceMemberStatus = 'active' | 'invited' | 'removed';

export type WorkspaceMemberProfile = {
  full_name: string | null;
  avatar_url: string | null;
};

export type WorkspaceMember = {
  id: string;
  workspace_id: string;
  user_id: string | null;
  invite_email: string | null;
  role: WorkspaceMemberRole;
  status: WorkspaceMemberStatus;
  invited_at: string | null;
  accepted_at: string | null;
  created_at: string;
  profile: WorkspaceMemberProfile | null;
};

export type ProfileSubmitInput = ProfileFormInput;
export type PreferencesSubmitInput = PreferencesFormInput;
export type WorkspaceSettingsSubmitInput = WorkspaceSettingsFormInput;
export type MemberInviteSubmitInput = MemberInviteFormInput;
