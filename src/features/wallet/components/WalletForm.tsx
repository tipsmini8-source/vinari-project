import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { walletSchema } from '@features/wallet/schemas/wallet.schemas';
import type { Wallet, WalletFormInput } from '@features/wallet/types/wallet.types';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';

const walletTypes = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
  { value: 'ewallet', label: 'E-Wallet' },
  { value: 'saving', label: 'Tabungan' },
  { value: 'investment', label: 'Investasi' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'gold', label: 'Emas' },
  { value: 'receivable', label: 'Piutang' },
  { value: 'other', label: 'Lainnya' }
];

const walletIcons = ['wallet', 'landmark', 'smartphone', 'piggy-bank', 'trending-up', 'coins'];
const walletColors = ['#0077B6', '#023E8A', '#00B4D8', '#16A34A', '#F59E0B', '#64748B'];

type WalletFormProps = {
  defaultWallet?: Wallet | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: WalletFormInput) => Promise<void>;
};

export function WalletForm({ defaultWallet, isSubmitting, onCancel, onSubmit }: WalletFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue
  } = useForm<WalletFormInput>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      name: '',
      walletType: 'bank',
      initialBalance: 0,
      icon: 'wallet',
      color: '#0077B6'
    }
  });

  const selectedIcon = useWatch({ control, name: 'icon' });
  const selectedColor = useWatch({ control, name: 'color' });

  useEffect(() => {
    reset({
      name: defaultWallet?.name ?? '',
      walletType: defaultWallet?.wallet_type ?? 'bank',
      initialBalance: defaultWallet?.initial_balance ?? 0,
      icon: defaultWallet?.icon ?? 'wallet',
      color: defaultWallet?.color ?? '#0077B6'
    });
  }, [defaultWallet, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="wallet-name">Nama Dompet</Label>
        <Input id="wallet-name" placeholder="Rekening Utama" {...register('name')} />
        {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="wallet-type">Jenis Dompet</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          id="wallet-type"
          {...register('walletType')}
        >
          {walletTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.walletType ? <p className="text-sm text-destructive">{errors.walletType.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="initial-balance">Saldo Awal</Label>
        <Input
          id="initial-balance"
          min="0"
          step="0.01"
          type="number"
          {...register('initialBalance', { valueAsNumber: true })}
        />
        {errors.initialBalance ? <p className="text-sm text-destructive">{errors.initialBalance.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {walletIcons.map((icon) => (
            <button
              className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                selectedIcon === icon ? 'border-primary bg-accent text-accent-foreground' : 'border-border'
              }`}
              key={icon}
              onClick={() => setValue('icon', icon, { shouldValidate: true })}
              type="button"
            >
              {icon}
            </button>
          ))}
        </div>
        {errors.icon ? <p className="text-sm text-destructive">{errors.icon.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label>Warna</Label>
        <div className="flex flex-wrap gap-2">
          {walletColors.map((color) => (
            <button
              aria-label={`Pilih warna ${color}`}
              className={`size-9 rounded-md border transition-transform ${
                selectedColor === color ? 'scale-105 border-foreground' : 'border-border'
              }`}
              key={color}
              onClick={() => setValue('color', color, { shouldValidate: true })}
              style={{ backgroundColor: color }}
              type="button"
            />
          ))}
        </div>
        {errors.color ? <p className="text-sm text-destructive">{errors.color.message}</p> : null}
      </div>

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
