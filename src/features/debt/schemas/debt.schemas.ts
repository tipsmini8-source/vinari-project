import { z } from 'zod';

const optionalPositiveNumber = z.number().min(0.01, 'Nominal wajib lebih besar dari 0.').optional();
const optionalNonNegativeNumber = z.number().min(0, 'Nilai tidak boleh negatif.').optional();

export const debtSchema = z
  .object({
    name: z.string().min(2, 'Nama hutang minimal 2 karakter.'),
    lenderName: z.string().optional(),
    principalAmount: z.number().min(0.01, 'Principal amount wajib lebih besar dari 0.'),
    installmentAmount: optionalPositiveNumber,
    interestRate: optionalNonNegativeNumber,
    dueDate: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.enum(['active', 'paid', 'cancelled'], {
      message: 'Status hutang tidak valid.'
    }),
    note: z.string().optional()
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

export const debtPaymentSchema = z.object({
  amount: z.number().min(0.01, 'Nominal pembayaran wajib lebih besar dari 0.'),
  paymentDate: z.string().min(1, 'Tanggal pembayaran wajib diisi.'),
  walletId: z.string().optional(),
  note: z.string().optional()
});
