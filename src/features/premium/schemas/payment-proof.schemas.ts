import { z } from 'zod';

export const allowedProofMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
export const allowedProofExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
export const maxProofSize = 5 * 1024 * 1024;

export const paymentProofSchema = z
  .object({
    proofFile: z.custom<FileList>(
      (value) => value instanceof FileList && value.length > 0,
      'File bukti pembayaran wajib dipilih.'
    )
  })
  .superRefine((value, context) => {
    const file = value.proofFile.item(0);

    if (!file) {
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

    if (!allowedProofMimeTypes.includes(file.type) || !allowedProofExtensions.includes(extension)) {
      context.addIssue({
        code: 'custom',
        message: 'Format file harus jpg, jpeg, png, webp, atau pdf.',
        path: ['proofFile']
      });
    }

    if (file.size > maxProofSize) {
      context.addIssue({
        code: 'custom',
        message: 'Ukuran file maksimal 5MB.',
        path: ['proofFile']
      });
    }
  });

export type PaymentProofFormInput = z.infer<typeof paymentProofSchema>;
