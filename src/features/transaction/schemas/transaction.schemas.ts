import { z } from 'zod';

const optionalUuid = z.string().optional();

export const transactionSchema = z
  .object({
    type: z.enum(['income', 'expense', 'transfer'], {
      message: 'Pilih tipe transaksi.'
    }),
    title: z.string().min(2, 'Keterangan minimal 2 karakter.'),
    amount: z.number().min(0.01, 'Jumlah uang wajib lebih besar dari 0.'),
    transactionDate: z.string().min(1, 'Tanggal transaksi wajib diisi.'),
    walletId: optionalUuid,
    destinationWalletId: optionalUuid,
    categoryId: optionalUuid,
    note: z.string().optional()
  })
  .superRefine((value, context) => {
    if (value.type === 'income' || value.type === 'expense') {
      if (!value.walletId) {
        context.addIssue({
          code: 'custom',
          message: 'Dompet wajib dipilih.',
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
    }

    if (value.type === 'transfer') {
      if (!value.walletId) {
        context.addIssue({
          code: 'custom',
          message: 'Dompet asal wajib dipilih.',
          path: ['walletId']
        });
      }

      if (!value.destinationWalletId) {
        context.addIssue({
          code: 'custom',
          message: 'Dompet tujuan wajib dipilih.',
          path: ['destinationWalletId']
        });
      }

      if (value.walletId && value.destinationWalletId && value.walletId === value.destinationWalletId) {
        context.addIssue({
          code: 'custom',
          message: 'Dompet tujuan tidak boleh sama dengan dompet asal.',
          path: ['destinationWalletId']
        });
      }
    }
  });

export const transactionFilterSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  type: z.enum(['all', 'income', 'expense', 'transfer']).default('all'),
  walletId: z.string().optional(),
  categoryId: z.string().optional()
});
