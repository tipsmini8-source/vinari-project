import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { debtPaymentSchema } from '@features/debt/schemas/debt.schemas';
import type { DebtPaymentFormInput, DebtReferenceWallet } from '@features/debt/types/debt.types';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';

type DebtPaymentFormProps = {
  isSubmitting: boolean;
  onSubmit: (input: DebtPaymentFormInput) => Promise<void>;
  remainingAmount: number;
  wallets: DebtReferenceWallet[];
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function DebtPaymentForm({ isSubmitting, onSubmit, remainingAmount, wallets }: DebtPaymentFormProps) {
  const {
    formState: { errors, isSubmitSuccessful },
    handleSubmit,
    register,
    reset
  } = useForm<DebtPaymentFormInput>({
    resolver: zodResolver(debtPaymentSchema),
    defaultValues: {
      amount: 0,
      paymentDate: today(),
      walletId: '',
      note: ''
    }
  });

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({
        amount: 0,
        paymentDate: today(),
        walletId: '',
        note: ''
      });
    }
  }, [isSubmitSuccessful, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Nominal pembayaran</Label>
          <Input
            disabled={remainingAmount <= 0}
            id="amount"
            max={remainingAmount}
            min="0.01"
            step="0.01"
            type="number"
            {...register('amount', { valueAsNumber: true })}
          />
          {errors.amount ? <p className="text-sm text-destructive">{errors.amount.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentDate">Tanggal</Label>
          <Input disabled={remainingAmount <= 0} id="paymentDate" type="date" {...register('paymentDate')} />
          {errors.paymentDate ? <p className="text-sm text-destructive">{errors.paymentDate.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="walletId">Wallet</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            disabled={remainingAmount <= 0}
            id="walletId"
            {...register('walletId')}
          >
            <option value="">Tanpa wallet</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">Catatan</Label>
          <Input disabled={remainingAmount <= 0} id="note" placeholder="Opsional" {...register('note')} />
        </div>
      </div>

      <Button disabled={isSubmitting || remainingAmount <= 0} type="submit">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        Tambah Pembayaran
      </Button>
    </form>
  );
}
