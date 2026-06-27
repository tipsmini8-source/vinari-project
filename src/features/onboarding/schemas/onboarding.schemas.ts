import { z } from 'zod';

export const onboardingSchema = z.object({
  usageType: z.enum(['personal', 'couple', 'family'], {
    message: 'Pilih tipe penggunaan Vinari.'
  }),
  workspaceName: z.string().min(2, 'Nama workspace minimal 2 karakter.'),
  currencyCode: z.string().min(3, 'Currency wajib diisi.'),
  walletName: z.string().min(2, 'Nama wallet minimal 2 karakter.'),
  walletType: z.string().min(1, 'Pilih tipe wallet.'),
  initialBalance: z.number().min(0, 'Saldo awal tidak boleh negatif.')
});
