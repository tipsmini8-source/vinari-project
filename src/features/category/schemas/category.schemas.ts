import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Nama kategori wajib diisi.'),
  type: z.enum(['income', 'expense'], {
    message: 'Type kategori wajib dipilih.'
  }),
  icon: z.string().trim().max(64, 'Icon terlalu panjang.').optional().or(z.literal('')),
  color: z.string().trim().max(32, 'Warna terlalu panjang.').optional().or(z.literal('')),
  sortOrder: z
    .number()
    .int('Sort order harus bilangan bulat.')
    .min(0, 'Sort order minimal 0.')
    .optional()
});

export type CategoryFormInput = z.infer<typeof categorySchema>;
