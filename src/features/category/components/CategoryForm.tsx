import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { createElement } from 'react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { categorySchema } from '@features/category/schemas/category.schemas';
import type { Category, CategorySubmitInput } from '@features/category/types/category.types';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { categoryIconOptions, getCategoryIcon } from '@shared/utils/icon-map';

type CategoryFormProps = {
  defaultCategory?: Category | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: CategorySubmitInput) => Promise<void>;
};

const selectClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70';

function asColorInputValue(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#0077b6';
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
      icon: 'circle-dollar-sign',
      color: '#0077b6',
      sortOrder: 0
    }
  });

  useEffect(() => {
    reset({
      name: defaultCategory?.name ?? '',
      type: defaultCategory?.type ?? 'expense',
      icon: defaultCategory?.icon ?? 'circle-dollar-sign',
      color: defaultCategory?.color ?? '#0077b6',
      sortOrder: defaultCategory?.sort_order ?? 0
    });
  }, [defaultCategory, reset]);

  const selectedColor = useWatch({ control, name: 'color' }) || '#0077b6';
  const selectedIcon = useWatch({ control, name: 'icon' }) || 'circle-dollar-sign';
  const iconOptions = categoryIconOptions.includes(selectedIcon) ? categoryIconOptions : [selectedIcon, ...categoryIconOptions];

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
          <Label htmlFor="type">Jenis kategori</Label>
          {isEdit ? (
            <>
              <input type="hidden" {...register('type')} />
              <select className={selectClassName} disabled id="type" value={defaultCategory?.type ?? 'expense'}>
                <option value="income">Uang Masuk</option>
                <option value="expense">Uang Keluar</option>
              </select>
            </>
          ) : (
            <select className={selectClassName} id="type" {...register('type')}>
              <option value="income">Uang Masuk</option>
              <option value="expense">Uang Keluar</option>
            </select>
          )}
          {errors.type ? <p className="text-sm text-destructive">{errors.type.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="icon">Icon</Label>
          <div className="flex gap-2">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-xl"
              style={{
                backgroundColor: /^#[0-9a-fA-F]{6}$/.test(selectedColor) ? `${selectedColor}18` : '#e0f2fe',
                color: /^#[0-9a-fA-F]{6}$/.test(selectedColor) ? selectedColor : '#0077b6'
              }}
            >
              {createElement(getCategoryIcon(selectedIcon), { className: 'size-5' })}
            </div>
            <select className={selectClassName} id="icon" {...register('icon')}>
              {iconOptions.map((iconName) => (
                <option key={iconName} value={iconName}>
                  {iconName}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            Contoh icon: home, receipt, shopping-bag, car.
          </p>
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
            <Input id="color" placeholder="#0077b6" {...register('color')} />
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
