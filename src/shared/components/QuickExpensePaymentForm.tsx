import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';

export type QuickExpenseWallet = {
  id: string;
  name: string;
};

export type QuickExpenseCategory = {
  id: string;
  name: string;
  type: 'income' | 'expense';
};

const quickExpensePaymentSchema = z.object({
  amount: z.number().min(0.01, 'Nominal wajib lebih besar dari 0.'),
  categoryId: z.string().min(1, 'Kategori wajib dipilih.'),
  note: z.string().optional(),
  paymentDate: z.string().min(1, 'Tanggal wajib diisi.'),
  walletId: z.string().min(1, 'Dompet wajib dipilih.')
});

export type QuickExpensePaymentInput = z.infer<typeof quickExpensePaymentSchema>;

type QuickExpensePaymentFormProps = {
  categories: QuickExpenseCategory[];
  defaultAmount: number;
  defaultCategoryId?: string | null;
  defaultNote?: string;
  defaultWalletId?: string | null;
  isSubmitting: boolean;
  maxAmount?: number;
  onSubmit: (input: QuickExpensePaymentInput) => Promise<void>;
  submitLabel: string;
  wallets: QuickExpenseWallet[];
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function QuickExpensePaymentForm({
  categories,
  defaultAmount,
  defaultCategoryId,
  defaultNote,
  defaultWalletId,
  isSubmitting,
  maxAmount,
  onSubmit,
  submitLabel,
  wallets
}: QuickExpensePaymentFormProps) {
  const expenseCategories = categories.filter((category) => category.type === 'expense');
  const fallbackCategory = defaultCategoryId ?? expenseCategories[0]?.id ?? '';
  const fallbackWallet = defaultWalletId ?? wallets[0]?.id ?? '';
  const {
    formState: { errors, isSubmitSuccessful },
    handleSubmit,
    register,
    reset
  } = useForm<QuickExpensePaymentInput>({
    resolver: zodResolver(quickExpensePaymentSchema),
    defaultValues: {
      amount: defaultAmount,
      categoryId: fallbackCategory,
      note: defaultNote ?? '',
      paymentDate: today(),
      walletId: fallbackWallet
    }
  });

  useEffect(() => {
    reset({
      amount: defaultAmount,
      categoryId: fallbackCategory,
      note: defaultNote ?? '',
      paymentDate: today(),
      walletId: fallbackWallet
    });
  }, [defaultAmount, defaultNote, fallbackCategory, fallbackWallet, reset]);

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({
        amount: defaultAmount,
        categoryId: fallbackCategory,
        note: defaultNote ?? '',
        paymentDate: today(),
        walletId: fallbackWallet
      });
    }
  }, [defaultAmount, defaultNote, fallbackCategory, fallbackWallet, isSubmitSuccessful, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="quick-payment-amount">Nominal pembayaran</Label>
          <Input
            id="quick-payment-amount"
            max={maxAmount}
            min="0.01"
            step="0.01"
            type="number"
            {...register('amount', { valueAsNumber: true })}
          />
          {errors.amount ? <p className="text-sm text-destructive">{errors.amount.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="quick-payment-date">Tanggal</Label>
          <Input id="quick-payment-date" type="date" {...register('paymentDate')} />
          {errors.paymentDate ? <p className="text-sm text-destructive">{errors.paymentDate.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="quick-payment-wallet">Dompet</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="quick-payment-wallet"
            {...register('walletId')}
          >
            <option value="">Pilih dompet</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </select>
          {errors.walletId ? <p className="text-sm text-destructive">{errors.walletId.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="quick-payment-category">Kategori</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="quick-payment-category"
            {...register('categoryId')}
          >
            <option value="">Pilih kategori</option>
            {expenseCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? <p className="text-sm text-destructive">{errors.categoryId.message}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quick-payment-note">Catatan</Label>
        <Input id="quick-payment-note" placeholder="Opsional" {...register('note')} />
      </div>

      <Button className="w-full rounded-2xl" disabled={isSubmitting} type="submit">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        {submitLabel}
      </Button>
    </form>
  );
}
