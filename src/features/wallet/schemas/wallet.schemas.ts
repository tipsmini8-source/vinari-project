import { z } from 'zod';

export const walletSchema = z.object({
  name: z.string().min(2, 'Nama wallet minimal 2 karakter.'),
  walletType: z.string().min(1, 'Pilih tipe wallet.'),
  initialBalance: z.number().min(0, 'Saldo awal tidak boleh negatif.'),
  icon: z.string().min(1, 'Icon wajib diisi.'),
  color: z.string().min(1, 'Warna wajib dipilih.')
});
