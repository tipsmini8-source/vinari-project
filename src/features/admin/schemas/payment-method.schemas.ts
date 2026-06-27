import { z } from 'zod';

export const qrisMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
export const qrisExtensions = ['jpg', 'jpeg', 'png', 'webp'];
export const maxQrisSize = 5 * 1024 * 1024;

export const paymentMethodSchema = z
  .object({
    methodType: z.enum(['qris', 'bank_transfer', 'ewallet', 'manual'], {
      message: 'Tipe metode pembayaran wajib dipilih.'
    }),
    name: z.string().trim().min(1, 'Nama metode pembayaran wajib diisi.'),
    accountName: z.string().trim().optional().or(z.literal('')),
    accountNumber: z.string().trim().optional().or(z.literal('')),
    bankName: z.string().trim().optional().or(z.literal('')),
    instructions: z.string().trim().optional().or(z.literal('')),
    isActive: z.boolean(),
    sortOrder: z.number().int('Sort order harus bilangan bulat.').min(0, 'Sort order minimal 0.'),
    qrisFile: z.custom<FileList>().optional()
  })
  .superRefine((value, context) => {
    const file = value.qrisFile?.item(0);

    if (!file) {
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

    if (!qrisMimeTypes.includes(file.type) || !qrisExtensions.includes(extension)) {
      context.addIssue({
        code: 'custom',
        message: 'File QRIS harus jpg, jpeg, png, atau webp.',
        path: ['qrisFile']
      });
    }

    if (file.size > maxQrisSize) {
      context.addIssue({
        code: 'custom',
        message: 'Ukuran file QRIS maksimal 5MB.',
        path: ['qrisFile']
      });
    }
  });

export type PaymentMethodFormInput = z.infer<typeof paymentMethodSchema>;
