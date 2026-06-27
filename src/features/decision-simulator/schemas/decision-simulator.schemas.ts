import { z } from 'zod';

export const expenseSimulationSchema = z
  .object({
    decisionName: z.string().trim().min(2, 'Nama keputusan minimal 2 karakter.'),
    amount: z.number().min(1, 'Nominal pengeluaran wajib lebih besar dari 0.'),
    walletId: z.string().trim().min(1, 'Wallet wajib dipilih.'),
    plannedDate: z.string().trim().min(1, 'Tanggal rencana wajib diisi.'),
    paymentMode: z.enum(['one_time', 'installment'], {
      message: 'Pilih cara bayar.'
    }),
    monthlyInstallment: z.number().optional(),
    installmentDurationMonths: z.number().optional()
  })
  .superRefine((value, context) => {
    if (value.paymentMode === 'installment') {
      if (!value.monthlyInstallment || value.monthlyInstallment <= 0) {
        context.addIssue({
          code: 'custom',
          message: 'Nominal cicilan per bulan wajib lebih besar dari 0.',
          path: ['monthlyInstallment']
        });
      }

      if (!value.installmentDurationMonths || value.installmentDurationMonths < 1) {
        context.addIssue({
          code: 'custom',
          message: 'Durasi cicilan minimal 1 bulan.',
          path: ['installmentDurationMonths']
        });
      }
    }
  });

export const debtSimulationSchema = z.object({
  debtName: z.string().trim().min(2, 'Nama hutang minimal 2 karakter.'),
  totalDebt: z.number().min(1, 'Total hutang wajib lebih besar dari 0.'),
  monthlyInstallment: z.number().min(1, 'Cicilan per bulan wajib lebih besar dari 0.'),
  durationMonths: z.number().min(1, 'Durasi minimal 1 bulan.'),
  startDate: z.string().trim().min(1, 'Tanggal mulai wajib diisi.')
});

export const goalSavingSimulationSchema = z.object({
  goalId: z.string().trim().min(1, 'Goal wajib dipilih.'),
  additionalMonthlySaving: z.number().min(1, 'Tambahan tabungan bulanan wajib lebih besar dari 0.')
});
