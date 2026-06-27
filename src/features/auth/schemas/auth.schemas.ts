import { z } from 'zod';

const emailSchema = z.string().min(1, 'Email wajib diisi.').email('Format email tidak valid.');
const passwordSchema = z.string().min(8, 'Password minimal 8 karakter.');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password wajib diisi.')
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter.'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi.')
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Konfirmasi password tidak sama.',
    path: ['confirmPassword']
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi.')
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Konfirmasi password tidak sama.',
    path: ['confirmPassword']
  });
