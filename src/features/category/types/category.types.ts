import type { CategoryFormInput } from '@features/category/schemas/category.schemas';

export type CategoryType = 'income' | 'expense';

export type Category = {
  id: string;
  workspace_id: string;
  name: string;
  type: CategoryType;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_archived: boolean;
  is_default: boolean;
  created_at: string;
};

export type CategorySubmitInput = CategoryFormInput;
