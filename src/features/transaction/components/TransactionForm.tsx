import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { transactionSchema } from '@features/transaction/schemas/transaction.schemas';
import type {
  Transaction,
  TransactionFormInput,
  TransactionReferenceCategory,
  TransactionReferenceWallet
} from '@features/transaction/types/transaction.types';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';

type TransactionFormProps = {
  categories: TransactionReferenceCategory[];
  defaultTransaction?: Transaction | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: TransactionFormInput) => Promise<void>;
  wallets: TransactionReferenceWallet[];
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionForm({
  categories,
  defaultTransaction,
  isSubmitting,
  onCancel,
  onSubmit,
  wallets
}: TransactionFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset
  } = useForm<TransactionFormInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      title: '',
      amount: 0,
      transactionDate: today(),
      walletId: '',
      destinationWalletId: '',
      categoryId: '',
      note: ''
    }
  });

  const selectedType = useWatch({ control, name: 'type' });
  const visibleCategories = categories.filter((category) => category.type === selectedType);

  useEffect(() => {
    reset({
      type:
        defaultTransaction?.type === 'income' ||
        defaultTransaction?.type === 'expense' ||
        defaultTransaction?.type === 'transfer'
          ? defaultTransaction.type
          : 'expense',
      title: defaultTransaction?.title ?? '',
      amount: defaultTransaction?.amount ?? 0,
      transactionDate: defaultTransaction?.transaction_date ?? today(),
      walletId: defaultTransaction?.wallet_id ?? '',
      destinationWalletId: defaultTransaction?.destination_wallet_id ?? '',
      categoryId: defaultTransaction?.category_id ?? '',
      note: defaultTransaction?.note ?? ''
    });
  }, [defaultTransaction, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="type">Tipe</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="type"
            {...register('type')}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </select>
          {errors.type ? <p className="text-sm text-destructive">{errors.type.message}</p> : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Judul</Label>
          <Input id="title" placeholder="Contoh: Gaji Juni" {...register('title')} />
          {errors.title ? <p className="text-sm text-destructive">{errors.title.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" min="0.01" step="0.01" type="number" {...register('amount', { valueAsNumber: true })} />
          {errors.amount ? <p className="text-sm text-destructive">{errors.amount.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="transactionDate">Tanggal</Label>
          <Input id="transactionDate" type="date" {...register('transactionDate')} />
          {errors.transactionDate ? (
            <p className="text-sm text-destructive">{errors.transactionDate.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="walletId">{selectedType === 'transfer' ? 'Wallet sumber' : 'Wallet'}</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="walletId"
            {...register('walletId')}
          >
            <option value="">Pilih wallet</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </select>
          {errors.walletId ? <p className="text-sm text-destructive">{errors.walletId.message}</p> : null}
        </div>

        {selectedType === 'transfer' ? (
          <div className="space-y-2">
            <Label htmlFor="destinationWalletId">Wallet tujuan</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="destinationWalletId"
              {...register('destinationWalletId')}
            >
              <option value="">Pilih wallet tujuan</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
            {errors.destinationWalletId ? (
              <p className="text-sm text-destructive">{errors.destinationWalletId.message}</p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="categoryId">Kategori</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="categoryId"
              {...register('categoryId')}
            >
              <option value="">Pilih kategori</option>
              {visibleCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId ? <p className="text-sm text-destructive">{errors.categoryId.message}</p> : null}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Catatan</Label>
        <Input id="note" placeholder="Opsional" {...register('note')} />
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
