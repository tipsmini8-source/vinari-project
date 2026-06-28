import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import {
  preferencesSchema,
  profileSchema,
  workspaceSettingsSchema
} from '@features/settings/schemas/settings.schemas';
import type {
  PreferencesSubmitInput,
  ProfileSubmitInput,
  UserPreferences,
  UserProfile,
  WorkspaceSettings,
  WorkspaceSettingsSubmitInput
} from '@features/settings/types/settings.types';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';

const selectClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70';

export function ProfileForm({
  defaultProfile,
  isSubmitting,
  onSubmit
}: {
  defaultProfile: UserProfile;
  isSubmitting: boolean;
  onSubmit: (input: ProfileSubmitInput) => Promise<void>;
}) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset
  } = useForm<ProfileSubmitInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      avatarUrl: '',
      timezone: 'Asia/Jakarta',
      locale: 'id-ID',
      currencyCode: 'IDR'
    }
  });

  useEffect(() => {
    reset({
      fullName: defaultProfile.full_name ?? '',
      avatarUrl: defaultProfile.avatar_url ?? '',
      timezone: defaultProfile.timezone,
      locale: defaultProfile.locale,
      currencyCode: defaultProfile.currency_code
    });
  }, [defaultProfile, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nama lengkap</Label>
          <Input id="fullName" {...register('fullName')} />
          {errors.fullName ? <p className="text-sm text-destructive">{errors.fullName.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="avatarUrl">Avatar URL</Label>
          <Input id="avatarUrl" placeholder="https://..." {...register('avatarUrl')} />
          {errors.avatarUrl ? <p className="text-sm text-destructive">{errors.avatarUrl.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input id="timezone" placeholder="Asia/Jakarta" {...register('timezone')} />
          {errors.timezone ? <p className="text-sm text-destructive">{errors.timezone.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="locale">Locale</Label>
          <Input id="locale" placeholder="id-ID" {...register('locale')} />
          {errors.locale ? <p className="text-sm text-destructive">{errors.locale.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="currencyCode">Currency</Label>
          <Input id="currencyCode" maxLength={3} placeholder="IDR" {...register('currencyCode')} />
          {errors.currencyCode ? <p className="text-sm text-destructive">{errors.currencyCode.message}</p> : null}
        </div>
      </div>

      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Simpan Profil
      </Button>
    </form>
  );
}

export function PreferencesForm({
  defaultPreferences,
  isSubmitting,
  onSubmit
}: {
  defaultPreferences: UserPreferences;
  isSubmitting: boolean;
  onSubmit: (input: PreferencesSubmitInput) => Promise<void>;
}) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset
  } = useForm<PreferencesSubmitInput>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      theme: 'system',
      language: 'id',
      currencyCode: 'IDR',
      dateFormat: 'DD/MM/YYYY',
      firstDayOfWeek: 'monday',
      emailNotification: true,
      appTemplate: defaultPreferences.app_template,
      pushNotification: true
    }
  });

  useEffect(() => {
    reset({
      theme: defaultPreferences.theme,
      language: defaultPreferences.language,
      currencyCode: defaultPreferences.currency_code,
      dateFormat: defaultPreferences.date_format,
      firstDayOfWeek: defaultPreferences.first_day_of_week,
      emailNotification: defaultPreferences.email_notification,
      appTemplate: defaultPreferences.app_template,
      pushNotification: defaultPreferences.push_notification
    });
  }, [defaultPreferences, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" {...register('appTemplate')} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <select className={selectClassName} id="theme" {...register('theme')}>
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          {errors.theme ? <p className="text-sm text-destructive">{errors.theme.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Bahasa</Label>
          <select className={selectClassName} id="language" {...register('language')}>
            <option value="id">Indonesia</option>
            <option value="en">English</option>
          </select>
          {errors.language ? <p className="text-sm text-destructive">{errors.language.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="currencyCode">Mata uang default</Label>
          <Input id="currencyCode" maxLength={3} {...register('currencyCode')} />
          {errors.currencyCode ? <p className="text-sm text-destructive">{errors.currencyCode.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dateFormat">Format tanggal</Label>
          <Input id="dateFormat" placeholder="DD/MM/YYYY" {...register('dateFormat')} />
          {errors.dateFormat ? <p className="text-sm text-destructive">{errors.dateFormat.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="firstDayOfWeek">Hari pertama minggu</Label>
          <select className={selectClassName} id="firstDayOfWeek" {...register('firstDayOfWeek')}>
            <option value="monday">Senin</option>
            <option value="sunday">Minggu</option>
          </select>
          {errors.firstDayOfWeek ? <p className="text-sm text-destructive">{errors.firstDayOfWeek.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-3 rounded-md border border-border p-3 text-sm">
          <input className="size-4 accent-primary" type="checkbox" {...register('emailNotification')} />
          Notifikasi email
        </label>
        <label className="flex items-center gap-3 rounded-md border border-border p-3 text-sm">
          <input className="size-4 accent-primary" type="checkbox" {...register('pushNotification')} />
          Notifikasi push
        </label>
      </div>

      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Simpan Preferensi
      </Button>
    </form>
  );
}

export function WorkspaceNameForm({
  canEdit,
  defaultWorkspace,
  isSubmitting,
  onSubmit
}: {
  canEdit: boolean;
  defaultWorkspace: WorkspaceSettings;
  isSubmitting: boolean;
  onSubmit: (input: WorkspaceSettingsSubmitInput) => Promise<void>;
}) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset
  } = useForm<WorkspaceSettingsSubmitInput>({
    resolver: zodResolver(workspaceSettingsSchema),
    defaultValues: {
      name: ''
    }
  });

  useEffect(() => {
    reset({
      name: defaultWorkspace.name
    });
  }, [defaultWorkspace, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="workspaceName">Nama workspace</Label>
        <Input id="workspaceName" readOnly={!canEdit} {...register('name')} />
        {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
      </div>

      {canEdit ? (
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Simpan Workspace
        </Button>
      ) : null}
    </form>
  );
}
