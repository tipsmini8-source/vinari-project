import { z } from 'zod';

export const scheduleCycleSchema = z.enum(['daily', 'weekly', 'monthly', 'yearly'], {
  message: 'Pilih frekuensi yang valid.'
});

export const recurringTransactionSchema = z
  .object({
    title: z.string().min(2, 'Judul minimal 2 karakter.'),
    type: z.enum(['income', 'expense'], {
      message: 'Pilih tipe transaksi.'
    }),
    amount: z.number().min(0.01, 'Nominal wajib lebih besar dari 0.'),
    frequency: scheduleCycleSchema,
    startDate: z.string().min(1, 'Tanggal mulai wajib diisi.'),
    endDate: z.string().optional(),
    nextRunDate: z.string().min(1, 'Tanggal jalan berikutnya wajib diisi.'),
    walletId: z.string().optional(),
    categoryId: z.string().optional(),
    isActive: z.boolean(),
    note: z.string().optional()
  })
  .superRefine((value, context) => {
    if (!value.walletId) {
      context.addIssue({
        code: 'custom',
        message: 'Wallet wajib dipilih.',
        path: ['walletId']
      });
    }

    if (!value.categoryId) {
      context.addIssue({
        code: 'custom',
        message: 'Kategori wajib dipilih.',
        path: ['categoryId']
      });
    }

    if (value.endDate && value.endDate < value.startDate) {
      context.addIssue({
        code: 'custom',
        message: 'Tanggal selesai harus setelah atau sama dengan tanggal mulai.',
        path: ['endDate']
      });
    }

    if (value.nextRunDate && value.nextRunDate < value.startDate) {
      context.addIssue({
        code: 'custom',
        message: 'Next run harus setelah atau sama dengan tanggal mulai.',
        path: ['nextRunDate']
      });
    }
  });

export const subscriptionSchema = z.object({
  name: z.string().min(2, 'Nama subscription minimal 2 karakter.'),
  amount: z.number().min(0.01, 'Nominal wajib lebih besar dari 0.'),
  billingCycle: scheduleCycleSchema,
  nextDueDate: z.string().min(1, 'Tanggal jatuh tempo wajib diisi.'),
  walletId: z.string().optional(),
  categoryId: z.string().optional(),
  isActive: z.boolean(),
  note: z.string().optional()
});

export type RecurringTransactionFormInput = z.infer<typeof recurringTransactionSchema>;
export type SubscriptionFormInput = z.infer<typeof subscriptionSchema>;
