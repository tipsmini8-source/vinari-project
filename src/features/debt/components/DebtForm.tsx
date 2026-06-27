import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { debtSchema } from '@features/debt/schemas/debt.schemas';
import type { DebtFormInput, DebtWithProgress } from '@features/debt/types/debt.types';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';

type DebtFormProps = {
  defaultDebt?: DebtWithProgress | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: DebtFormInput) => Promise<void>;
};

export function DebtForm({ defaultDebt, isSubmitting, onCancel, onSubmit }: DebtFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset
  } = useForm<DebtFormInput>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      name: '',
      lenderName: '',
      principalAmount: 0,
      installmentAmount: undefined,
      interestRate: 0,
      dueDate: '',
      startDate: '',
      endDate: '',
      status: 'active',
      note: ''
    }
  });

  useEffect(() => {
    reset({
      name: defaultDebt?.name ?? '',
      lenderName: defaultDebt?.lender_name ?? '',
      principalAmount: defaultDebt?.principal_amount ?? 0,
      installmentAmount: defaultDebt?.installment_amount ?? undefined,
      interestRate: defaultDebt?.interest_rate ?? 0,
      dueDate: defaultDebt?.due_date ?? '',
      startDate: defaultDebt?.start_date ?? '',
      endDate: defaultDebt?.end_date ?? '',
      status: defaultDebt?.status ?? 'active',
      note: defaultDebt?.note ?? ''
    });
  }, [defaultDebt, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nama hutang</Label>
          <Input id="name" placeholder="Contoh: Cicilan motor" {...register('name')} />
          {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lenderName">Pemberi hutang</Label>
          <Input id="lenderName" placeholder="Bank, teman, keluarga" {...register('lenderName')} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="principalAmount">Principal amount</Label>
          <Input
            id="principalAmount"
            min="0.01"
            step="0.01"
            type="number"
            {...register('principalAmount', { valueAsNumber: true })}
          />
          {errors.principalAmount ? <p className="text-sm text-destructive">{errors.principalAmount.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="installmentAmount">Cicilan</Label>
          <Input
            id="installmentAmount"
            min="0.01"
            placeholder="Opsional"
            step="0.01"
            type="number"
            {...register('installmentAmount', {
              setValueAs: (value) => (value === '' ? undefined : Number(value))
            })}
          />
          {errors.installmentAmount ? (
            <p className="text-sm text-destructive">{errors.installmentAmount.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="interestRate">Bunga (%)</Label>
          <Input
            id="interestRate"
            min="0"
            step="0.0001"
            type="number"
            {...register('interestRate', {
              setValueAs: (value) => (value === '' ? undefined : Number(value))
            })}
          />
          {errors.interestRate ? <p className="text-sm text-destructive">{errors.interestRate.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="startDate">Mulai</Label>
          <Input id="startDate" type="date" {...register('startDate')} />
          {errors.startDate ? <p className="text-sm text-destructive">{errors.startDate.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Jatuh tempo</Label>
          <Input id="dueDate" type="date" {...register('dueDate')} />
          {errors.dueDate ? <p className="text-sm text-destructive">{errors.dueDate.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Selesai</Label>
          <Input id="endDate" type="date" {...register('endDate')} />
          {errors.endDate ? <p className="text-sm text-destructive">{errors.endDate.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="status"
            {...register('status')}
          >
            <option value="active">Active</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {errors.status ? <p className="text-sm text-destructive">{errors.status.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">Catatan</Label>
          <Input id="note" placeholder="Opsional" {...register('note')} />
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
