import { z } from 'zod';

export const budgetSchema = z
  .object({
    name: z.string().min(2, 'Nama budget minimal 2 karakter.'),
    categoryId: z.string().min(1, 'Kategori expense wajib dipilih.'),
    amount: z.number().min(0.01, 'Nominal budget wajib lebih besar dari 0.'),
    startDate: z.string().min(1, 'Tanggal mulai wajib diisi.'),
    endDate: z.string().min(1, 'Tanggal selesai wajib diisi.'),
    alertPercentage: z
      .number()
      .int('Alert harus berupa angka bulat.')
      .min(1, 'Alert minimal 1%.')
      .max(100, 'Alert maksimal 100%.'),
    isActive: z.boolean()
  })
  .superRefine((value, context) => {
    if (value.startDate && value.endDate && value.endDate < value.startDate) {
      context.addIssue({
        code: 'custom',
        message: 'Tanggal selesai harus setelah atau sama dengan tanggal mulai.',
        path: ['endDate']
      });
    }
  });
