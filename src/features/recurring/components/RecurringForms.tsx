import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import {
  recurringTransactionSchema,
  subscriptionSchema
} from '@features/recurring/schemas/recurring.schemas';
import type {
  RecurringReferenceCategory,
  RecurringReferenceWallet,
  RecurringTransaction,
  RecurringTransactionSubmitInput,
  Subscription,
  SubscriptionSubmitInput
} from '@features/recurring/types/recurring.types';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';

type RecurringTransactionFormProps = {
  categories: RecurringReferenceCategory[];
  defaultRecurring?: RecurringTransaction | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: RecurringTransactionSubmitInput) => Promise<void>;
  wallets: RecurringReferenceWallet[];
};

type SubscriptionFormProps = {
  categories: RecurringReferenceCategory[];
  defaultSubscription?: Subscription | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: SubscriptionSubmitInput) => Promise<void>;
  wallets: RecurringReferenceWallet[];
};

const selectClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function RecurringTransactionForm({
  categories,
  defaultRecurring,
  isSubmitting,
  onCancel,
  onSubmit,
  wallets
}: RecurringTransactionFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset
  } = useForm<RecurringTransactionSubmitInput>({
    resolver: zodResolver(recurringTransactionSchema),
    defaultValues: {
      title: '',
      type: 'expense',
      amount: 0,
      frequency: 'monthly',
      startDate: today(),
      endDate: '',
      nextRunDate: today(),
      walletId: '',
      categoryId: '',
      isActive: true,
      note: ''
    }
  });

  const selectedType = useWatch({ control, name: 'type' });
  const visibleCategories = categories.filter((category) => category.type === selectedType);

  useEffect(() => {
    reset({
      title: defaultRecurring?.title ?? '',
      type: defaultRecurring?.type ?? 'expense',
      amount: defaultRecurring?.amount ?? 0,
      frequency: defaultRecurring?.frequency ?? 'monthly',
      startDate: defaultRecurring?.start_date ?? today(),
      endDate: defaultRecurring?.end_date ?? '',
      nextRunDate: defaultRecurring?.next_run_date ?? today(),
      walletId: defaultRecurring?.wallet_id ?? '',
      categoryId: defaultRecurring?.category_id ?? '',
      isActive: defaultRecurring?.is_active ?? true,
      note: defaultRecurring?.note ?? ''
    });
  }, [defaultRecurring, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="type">Tipe</Label>
          <select className={selectClassName} id="type" {...register('type')}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          {errors.type ? <p className="text-sm text-destructive">{errors.type.message}</p> : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Judul</Label>
          <Input id="title" placeholder="Contoh: Gaji bulanan" {...register('title')} />
          {errors.title ? <p className="text-sm text-destructive">{errors.title.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="amount">Nominal</Label>
          <Input id="amount" min="0.01" step="0.01" type="number" {...register('amount', { valueAsNumber: true })} />
          {errors.amount ? <p className="text-sm text-destructive">{errors.amount.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Frekuensi</Label>
          <select className={selectClassName} id="frequency" {...register('frequency')}>
            <option value="daily">Harian</option>
            <option value="weekly">Mingguan</option>
            <option value="monthly">Bulanan</option>
            <option value="yearly">Tahunan</option>
          </select>
          {errors.frequency ? <p className="text-sm text-destructive">{errors.frequency.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nextRunDate">Next run</Label>
          <Input id="nextRunDate" type="date" {...register('nextRunDate')} />
          {errors.nextRunDate ? <p className="text-sm text-destructive">{errors.nextRunDate.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="walletId">Wallet</Label>
          <select className={selectClassName} id="walletId" {...register('walletId')}>
            <option value="">Pilih wallet</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </select>
          {errors.walletId ? <p className="text-sm text-destructive">{errors.walletId.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Kategori</Label>
          <select className={selectClassName} id="categoryId" {...register('categoryId')}>
            <option value="">Pilih kategori</option>
            {visibleCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? <p className="text-sm text-destructive">{errors.categoryId.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Mulai</Label>
          <Input id="startDate" type="date" {...register('startDate')} />
          {errors.startDate ? <p className="text-sm text-destructive">{errors.startDate.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Selesai</Label>
          <Input id="endDate" type="date" {...register('endDate')} />
          {errors.endDate ? <p className="text-sm text-destructive">{errors.endDate.message}</p> : null}
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-md border border-border p-3 text-sm">
        <input className="size-4 accent-primary" type="checkbox" {...register('isActive')} />
        Recurring aktif
      </label>

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

export function SubscriptionForm({
  categories,
  defaultSubscription,
  isSubmitting,
  onCancel,
  onSubmit,
  wallets
}: SubscriptionFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset
  } = useForm<SubscriptionSubmitInput>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: '',
      amount: 0,
      billingCycle: 'monthly',
      nextDueDate: today(),
      walletId: '',
      categoryId: '',
      isActive: true,
      note: ''
    }
  });

  const expenseCategories = categories.filter((category) => category.type === 'expense');

  useEffect(() => {
    reset({
      name: defaultSubscription?.name ?? '',
      amount: defaultSubscription?.amount ?? 0,
      billingCycle: defaultSubscription?.billing_cycle ?? 'monthly',
      nextDueDate: defaultSubscription?.next_due_date ?? today(),
      walletId: defaultSubscription?.wallet_id ?? '',
      categoryId: defaultSubscription?.category_id ?? '',
      isActive: defaultSubscription?.is_active ?? true,
      note: defaultSubscription?.note ?? ''
    });
  }, [defaultSubscription, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nama subscription</Label>
          <Input id="name" placeholder="Contoh: Internet rumah" {...register('name')} />
          {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Nominal</Label>
          <Input id="amount" min="0.01" step="0.01" type="number" {...register('amount', { valueAsNumber: true })} />
          {errors.amount ? <p className="text-sm text-destructive">{errors.amount.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="billingCycle">Billing cycle</Label>
          <select className={selectClassName} id="billingCycle" {...register('billingCycle')}>
            <option value="daily">Harian</option>
            <option value="weekly">Mingguan</option>
            <option value="monthly">Bulanan</option>
            <option value="yearly">Tahunan</option>
          </select>
          {errors.billingCycle ? <p className="text-sm text-destructive">{errors.billingCycle.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nextDueDate">Next due</Label>
          <Input id="nextDueDate" type="date" {...register('nextDueDate')} />
          {errors.nextDueDate ? <p className="text-sm text-destructive">{errors.nextDueDate.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="subscriptionWalletId">Wallet</Label>
          <select className={selectClassName} id="subscriptionWalletId" {...register('walletId')}>
            <option value="">Tanpa wallet</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subscriptionCategoryId">Kategori expense</Label>
          <select className={selectClassName} id="subscriptionCategoryId" {...register('categoryId')}>
            <option value="">Tanpa kategori</option>
            {expenseCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-md border border-border p-3 text-sm">
        <input className="size-4 accent-primary" type="checkbox" {...register('isActive')} />
        Subscription aktif
      </label>

      <div className="space-y-2">
        <Label htmlFor="subscriptionNote">Catatan</Label>
        <Input id="subscriptionNote" placeholder="Opsional" {...register('note')} />
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
