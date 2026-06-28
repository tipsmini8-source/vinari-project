import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { budgetSchema } from '@features/budget/schemas/budget.schemas';
import type {
  BudgetFormInput,
  BudgetReferenceCategory,
  BudgetWithProgress
} from '@features/budget/types/budget.types';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';

type BudgetFormProps = {
  categories: BudgetReferenceCategory[];
  defaultBudget?: BudgetWithProgress | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: BudgetFormInput) => Promise<void>;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function endOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
}

export function BudgetForm({ categories, defaultBudget, isSubmitting, onCancel, onSubmit }: BudgetFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset
  } = useForm<BudgetFormInput>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: '',
      categoryId: '',
      amount: 0,
      startDate: today(),
      endDate: endOfCurrentMonth(),
      alertPercentage: 80,
      isActive: true
    }
  });

  useEffect(() => {
    reset({
      name: defaultBudget?.name ?? '',
      categoryId: defaultBudget?.category_id ?? '',
      amount: defaultBudget?.amount ?? 0,
      startDate: defaultBudget?.start_date ?? today(),
      endDate: defaultBudget?.end_date ?? endOfCurrentMonth(),
      alertPercentage: defaultBudget?.alert_percentage ?? 80,
      isActive: defaultBudget?.is_active ?? true
    });
  }, [defaultBudget, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="name">Nama batas pengeluaran</Label>
        <Input id="name" placeholder="Contoh: Belanja bulanan" {...register('name')} />
        {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Kategori uang keluar</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="categoryId"
            {...register('categoryId')}
          >
            <option value="">Pilih kategori uang keluar</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? <p className="text-sm text-destructive">{errors.categoryId.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Nominal batas</Label>
          <Input id="amount" min="0.01" step="0.01" type="number" {...register('amount', { valueAsNumber: true })} />
          {errors.amount ? <p className="text-sm text-destructive">{errors.amount.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
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

        <div className="space-y-2">
          <Label htmlFor="alertPercentage">Peringatan (%)</Label>
          <Input
            id="alertPercentage"
            max="100"
            min="1"
            step="1"
            type="number"
            {...register('alertPercentage', { valueAsNumber: true })}
          />
          {errors.alertPercentage ? (
            <p className="text-sm text-destructive">{errors.alertPercentage.message}</p>
          ) : null}
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-md border border-border p-3 text-sm">
        <input className="size-4 accent-primary" type="checkbox" {...register('isActive')} />
        Batas pengeluaran aktif
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
