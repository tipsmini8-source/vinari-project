import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Nama lengkap minimal 2 karakter.'),
  avatarUrl: z.string().trim().url('Avatar URL tidak valid.').optional().or(z.literal('')),
  timezone: z.string().trim().min(1, 'Timezone wajib diisi.'),
  locale: z.string().trim().min(1, 'Locale wajib diisi.'),
  currencyCode: z.string().trim().min(3, 'Currency wajib diisi.').max(3, 'Currency harus 3 karakter.')
});

export const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system'], {
    message: 'Theme tidak valid.'
  }),
  language: z.enum(['id', 'en'], {
    message: 'Bahasa tidak valid.'
  }),
  currencyCode: z.string().trim().min(3, 'Mata uang wajib diisi.').max(3, 'Mata uang harus 3 karakter.'),
  dateFormat: z.string().trim().min(1, 'Format tanggal wajib diisi.'),
  firstDayOfWeek: z.enum(['monday', 'sunday'], {
    message: 'Hari pertama minggu tidak valid.'
  }),
  emailNotification: z.boolean(),
  pushNotification: z.boolean()
});

export const workspaceSettingsSchema = z.object({
  name: z.string().trim().min(2, 'Nama workspace minimal 2 karakter.')
});

export type ProfileFormInput = z.infer<typeof profileSchema>;
export type PreferencesFormInput = z.infer<typeof preferencesSchema>;
export type WorkspaceSettingsFormInput = z.infer<typeof workspaceSettingsSchema>;
