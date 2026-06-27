import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { categorySchema } from '@features/category/schemas/category.schemas';
import type { Category, CategorySubmitInput } from '@features/category/types/category.types';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';

type CategoryFormProps = {
  defaultCategory?: Category | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: CategorySubmitInput) => Promise<void>;
};

const selectClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70';

function asColorInputValue(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#2563eb';
}

export function CategoryForm({ defaultCategory, isSubmitting, onCancel, onSubmit }: CategoryFormProps) {
  const isEdit = Boolean(defaultCategory);
  const isDefaultCategory = Boolean(defaultCategory?.is_default);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue
  } = useForm<CategorySubmitInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'expense',
      icon: '',
      color: '#2563eb',
      sortOrder: 0
    }
  });

  useEffect(() => {
    reset({
      name: defaultCategory?.name ?? '',
      type: defaultCategory?.type ?? 'expense',
      icon: defaultCategory?.icon ?? '',
      color: defaultCategory?.color ?? '#2563eb',
      sortOrder: defaultCategory?.sort_order ?? 0
    });
  }, [defaultCategory, reset]);

  const selectedColor = useWatch({ control, name: 'color' }) || '#2563eb';

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nama kategori</Label>
          <Input
            id="name"
            placeholder="Contoh: Makan"
            readOnly={isDefaultCategory}
            {...register('name')}
          />
          {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          {isEdit ? (
            <>
              <input type="hidden" {...register('type')} />
              <select className={selectClassName} disabled id="type" value={defaultCategory?.type ?? 'expense'}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </>
          ) : (
            <select className={selectClassName} id="type" {...register('type')}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          )}
          {errors.type ? <p className="text-sm text-destructive">{errors.type.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="icon">Icon</Label>
          <Input id="icon" placeholder="Contoh: Utensils" {...register('icon')} />
          {errors.icon ? <p className="text-sm text-destructive">{errors.icon.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Warna</Label>
          <div className="flex gap-2">
            <Input
              className="w-14 p-1"
              id="color-picker"
              onChange={(event) => setValue('color', event.target.value, { shouldDirty: true, shouldValidate: true })}
              type="color"
              value={asColorInputValue(selectedColor)}
            />
            <Input id="color" placeholder="#2563eb" {...register('color')} />
          </div>
          {errors.color ? <p className="text-sm text-destructive">{errors.color.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort order</Label>
          <Input
            id="sortOrder"
            min="0"
            readOnly={isDefaultCategory}
            step="1"
            type="number"
            {...register('sortOrder', {
              setValueAs: (value) => (value === '' ? undefined : Number(value))
            })}
          />
          {errors.sortOrder ? <p className="text-sm text-destructive">{errors.sortOrder.message}</p> : null}
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
