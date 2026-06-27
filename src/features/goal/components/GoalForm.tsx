import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { goalSchema } from '@features/goal/schemas/goal.schemas';
import type { GoalFormInput, GoalReferenceWallet, GoalWithProgress } from '@features/goal/types/goal.types';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';

type GoalFormProps = {
  defaultGoal?: GoalWithProgress | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: GoalFormInput) => Promise<void>;
  wallets: GoalReferenceWallet[];
};

export function GoalForm({ defaultGoal, isSubmitting, onCancel, onSubmit, wallets }: GoalFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset
  } = useForm<GoalFormInput>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      targetDate: '',
      walletId: '',
      status: 'active',
      icon: '',
      color: ''
    }
  });

  useEffect(() => {
    reset({
      name: defaultGoal?.name ?? '',
      targetAmount: defaultGoal?.target_amount ?? 0,
      currentAmount: defaultGoal?.current_amount ?? 0,
      targetDate: defaultGoal?.target_date ?? '',
      walletId: defaultGoal?.wallet_id ?? '',
      status: defaultGoal?.status ?? 'active',
      icon: defaultGoal?.icon ?? '',
      color: defaultGoal?.color ?? ''
    });
  }, [defaultGoal, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="name">Nama goal</Label>
        <Input id="name" placeholder="Contoh: Dana darurat" {...register('name')} />
        {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="targetAmount">Target amount</Label>
          <Input
            id="targetAmount"
            min="0.01"
            step="0.01"
            type="number"
            {...register('targetAmount', { valueAsNumber: true })}
          />
          {errors.targetAmount ? <p className="text-sm text-destructive">{errors.targetAmount.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentAmount">Current amount</Label>
          <Input
            id="currentAmount"
            min="0"
            step="0.01"
            type="number"
            {...register('currentAmount', { valueAsNumber: true })}
          />
          {errors.currentAmount ? <p className="text-sm text-destructive">{errors.currentAmount.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="targetDate">Target date</Label>
          <Input id="targetDate" type="date" {...register('targetDate')} />
          {errors.targetDate ? <p className="text-sm text-destructive">{errors.targetDate.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="walletId">Wallet tabungan</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="walletId"
            {...register('walletId')}
          >
            <option value="">Tanpa wallet khusus</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </select>
          {errors.walletId ? <p className="text-sm text-destructive">{errors.walletId.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="status"
            {...register('status')}
          >
            <option value="active">Active</option>
            <option value="achieved">Achieved</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {errors.status ? <p className="text-sm text-destructive">{errors.status.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="icon">Icon</Label>
          <Input id="icon" placeholder="Opsional" {...register('icon')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Warna</Label>
          <Input id="color" placeholder="#16a34a" {...register('color')} />
        </div>
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
