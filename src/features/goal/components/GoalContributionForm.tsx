import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { goalContributionSchema } from '@features/goal/schemas/goal.schemas';
import type { GoalContributionFormInput, GoalReferenceWallet } from '@features/goal/types/goal.types';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';

type GoalContributionFormProps = {
  isSubmitting: boolean;
  onSubmit: (input: GoalContributionFormInput) => Promise<void>;
  wallets: GoalReferenceWallet[];
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function GoalContributionForm({ isSubmitting, onSubmit, wallets }: GoalContributionFormProps) {
  const {
    formState: { errors, isSubmitSuccessful },
    handleSubmit,
    register,
    reset
  } = useForm<GoalContributionFormInput>({
    resolver: zodResolver(goalContributionSchema),
    defaultValues: {
      amount: 0,
      contributionDate: today(),
      walletId: '',
      note: ''
    }
  });

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({
        amount: 0,
        contributionDate: today(),
        walletId: '',
        note: ''
      });
    }
  }, [isSubmitSuccessful, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Nominal kontribusi</Label>
          <Input id="amount" min="0.01" step="0.01" type="number" {...register('amount', { valueAsNumber: true })} />
          {errors.amount ? <p className="text-sm text-destructive">{errors.amount.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contributionDate">Tanggal</Label>
          <Input id="contributionDate" type="date" {...register('contributionDate')} />
          {errors.contributionDate ? (
            <p className="text-sm text-destructive">{errors.contributionDate.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="walletId">Dompet</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="walletId"
            {...register('walletId')}
          >
            <option value="">Tanpa dompet</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">Catatan</Label>
          <Input id="note" placeholder="Opsional" {...register('note')} />
        </div>
      </div>

      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        Tambah Kontribusi
      </Button>
    </form>
  );
}
