import type {
  PreferencesFormInput,
  ProfileFormInput,
  WorkspaceSettingsFormInput
} from '@features/settings/schemas/settings.schemas';

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

export type ProfileSubmitInput = ProfileFormInput;
export type PreferencesSubmitInput = PreferencesFormInput;
export type WorkspaceSettingsSubmitInput = WorkspaceSettingsFormInput;
