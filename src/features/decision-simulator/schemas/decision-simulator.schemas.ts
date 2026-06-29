import { z } from 'zod';

export const paymentFrequencySchema = z.enum(['daily', 'weekly', 'monthly'], {
  message: 'Pilih frekuensi cicilan.'
});

export const interestTypeSchema = z.enum(['none', 'flat'], {
  message: 'Pilih jenis bunga.'
});

export const interestPeriodSchema = z.enum(['total', 'yearly', 'monthly'], {
  message: 'Pilih periode bunga.'
});

export const calculationModeSchema = z.enum(['by_tenor', 'by_payment'], {
  message: 'Pilih mode hitung.'
});

const installmentFields = {
  calculationMode: calculationModeSchema,
  downPayment: z.number().min(0, 'DP tidak boleh negatif.'),
  frequency: paymentFrequencySchema,
  interestPercent: z.number().min(0, 'Bunga tidak boleh negatif.'),
  interestPeriod: interestPeriodSchema,
  interestType: interestTypeSchema,
  paymentPerPeriod: z.number().optional(),
  tenurePeriods: z.number().optional()
};

function validateInstallmentFields(
  value: {
    calculationMode: 'by_tenor' | 'by_payment';
    downPayment?: number;
    interestType: 'none' | 'flat';
    paymentPerPeriod?: number;
    tenurePeriods?: number;
  },
  context: z.RefinementCtx,
  totalAmount: number
) {
  if ((value.downPayment ?? 0) >= totalAmount) {
    context.addIssue({
      code: 'custom',
      message: 'DP harus lebih kecil dari total nominal.',
      path: ['downPayment']
    });
  }

  if (value.calculationMode === 'by_tenor' && (!value.tenurePeriods || value.tenurePeriods < 1)) {
    context.addIssue({
      code: 'custom',
      message: 'Lama cicilan minimal 1 periode.',
      path: ['tenurePeriods']
    });
  }

  if (value.calculationMode === 'by_payment' && (!value.paymentPerPeriod || value.paymentPerPeriod <= 0)) {
    context.addIssue({
      code: 'custom',
      message: 'Kemampuan bayar wajib lebih besar dari 0.',
      path: ['paymentPerPeriod']
    });
  }
}

export const expenseSimulationSchema = z
  .object({
    decisionName: z.string().trim().min(2, 'Nama keputusan minimal 2 karakter.'),
    amount: z.number().min(1, 'Nominal pengeluaran wajib lebih besar dari 0.'),
    walletId: z.string().trim().min(1, 'Dompet wajib dipilih.'),
    plannedDate: z.string().trim().min(1, 'Tanggal rencana wajib diisi.'),
    paymentMode: z.enum(['one_time', 'installment'], {
      message: 'Pilih cara bayar.'
    }),
    ...installmentFields
  })
  .superRefine((value, context) => {
    if (value.paymentMode === 'installment') {
      validateInstallmentFields(value, context, value.amount);
    }
  });

export const debtSimulationSchema = z
  .object({
    debtName: z.string().trim().min(2, 'Nama cicilan minimal 2 karakter.'),
    totalDebt: z.number().min(1, 'Total hutang wajib lebih besar dari 0.'),
    startDate: z.string().trim().min(1, 'Tanggal mulai wajib diisi.'),
    ...installmentFields
  })
  .superRefine((value, context) => {
    validateInstallmentFields(value, context, value.totalDebt);
  });

export const goalSavingSimulationSchema = z
  .object({
    additionalSaving: z.number().min(1, 'Nominal tambahan tabungan wajib lebih besar dari 0.'),
    frequency: z.enum(['once', 'daily', 'weekly', 'monthly'], {
      message: 'Pilih frekuensi tabungan.'
    }),
    goalId: z.string().trim().min(1, 'Target wajib dipilih.'),
    reduceWallet: z.boolean(),
    startDate: z.string().trim().min(1, 'Tanggal mulai wajib diisi.'),
    walletId: z.string().optional()
  })
  .superRefine((value, context) => {
    if (value.reduceWallet && !value.walletId) {
      context.addIssue({
        code: 'custom',
        message: 'Pilih dompet jika tabungan mengurangi saldo.',
        path: ['walletId']
      });
    }
  });
