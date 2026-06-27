import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import {
  paymentMethodSchema,
  type PaymentMethodFormInput
} from '@features/admin/schemas/payment-method.schemas';
import type { AdminPaymentMethod } from '@features/admin/types/admin.types';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';

type AdminPaymentMethodFormProps = {
  defaultMethod?: AdminPaymentMethod | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: PaymentMethodFormInput) => Promise<void>;
};

const selectClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function AdminPaymentMethodForm({
  defaultMethod,
  isSubmitting,
  onCancel,
  onSubmit
}: AdminPaymentMethodFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset
  } = useForm<PaymentMethodFormInput>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      methodType: 'qris',
      name: '',
      accountName: '',
      accountNumber: '',
      bankName: '',
      instructions: '',
      isActive: true,
      sortOrder: 0
    }
  });

  useEffect(() => {
    reset({
      methodType: defaultMethod?.method_type ?? 'qris',
      name: defaultMethod?.name ?? '',
      accountName: defaultMethod?.account_name ?? '',
      accountNumber: defaultMethod?.account_number ?? '',
      bankName: defaultMethod?.bank_name ?? '',
      instructions: defaultMethod?.instructions ?? '',
      isActive: defaultMethod?.is_active ?? true,
      sortOrder: defaultMethod?.sort_order ?? 0
    });
  }, [defaultMethod, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="methodType">Tipe metode pembayaran</Label>
          <select className={selectClassName} id="methodType" {...register('methodType')}>
            <option value="qris">QRIS</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="ewallet">E-Wallet</option>
            <option value="manual">Manual</option>
          </select>
          {errors.methodType ? <p className="text-sm text-destructive">{errors.methodType.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nama metode pembayaran</Label>
          <Input id="name" placeholder="QRIS Vinari" {...register('name')} />
          {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="accountName">Atas nama</Label>
          <Input id="accountName" {...register('accountName')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountNumber">Nomor rekening/e-wallet</Label>
          <Input id="accountNumber" {...register('accountNumber')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bankName">Nama bank</Label>
          <Input id="bankName" {...register('bankName')} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="qrisFile">Upload gambar QRIS</Label>
        <Input
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          id="qrisFile"
          type="file"
          {...register('qrisFile')}
        />
        {errors.qrisFile ? <p className="text-sm text-destructive">{errors.qrisFile.message}</p> : null}
        {defaultMethod?.qr_image_public_url ? (
          <img
            alt={`QRIS ${defaultMethod.name}`}
            className="mt-3 max-h-64 rounded-md border border-border object-contain"
            src={defaultMethod.qr_image_public_url}
          />
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <div className="space-y-2">
          <Label htmlFor="instructions">Instruksi pembayaran</Label>
          <Input id="instructions" placeholder="Scan QRIS lalu upload bukti pembayaran." {...register('instructions')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort order</Label>
          <Input
            id="sortOrder"
            min="0"
            step="1"
            type="number"
            {...register('sortOrder', { valueAsNumber: true })}
          />
          {errors.sortOrder ? <p className="text-sm text-destructive">{errors.sortOrder.message}</p> : null}
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-md border border-border p-3 text-sm">
        <input className="size-4 accent-primary" type="checkbox" {...register('isActive')} />
        Metode aktif
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="outline">
          Batal
        </Button>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Simpan
        </Button>
      </div>
    </form>
  );
}
