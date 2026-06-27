import { z } from 'zod';

export const goalSchema = z.object({
  name: z.string().min(2, 'Nama goal minimal 2 karakter.'),
  targetAmount: z.number().min(0.01, 'Target amount wajib lebih besar dari 0.'),
  currentAmount: z.number().min(0, 'Current amount tidak boleh negatif.'),
  targetDate: z.string().optional(),
  walletId: z.string().optional(),
  status: z.enum(['active', 'achieved', 'cancelled'], {
    message: 'Status goal tidak valid.'
  }),
  icon: z.string().optional(),
  color: z.string().optional()
});

export const goalContributionSchema = z.object({
  amount: z.number().min(0.01, 'Nominal kontribusi wajib lebih besar dari 0.'),
  contributionDate: z.string().min(1, 'Tanggal kontribusi wajib diisi.'),
  walletId: z.string().optional(),
  note: z.string().optional()
});
