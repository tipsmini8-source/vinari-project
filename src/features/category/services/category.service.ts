import { supabase } from '@/lib/supabase';
import type { CategoryFormInput } from '@features/category/schemas/category.schemas';
import type { Category, CategoryType } from '@features/category/types/category.types';

type SupabaseErrorLike = {
  message?: string;
};

function assertSupabaseSuccess(error: SupabaseErrorLike | null, fallbackMessage: string) {
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asOptionalString(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: asString(row.id),
    workspace_id: asString(row.workspace_id),
    name: asString(row.name),
    type: row.type === 'income' ? 'income' : 'expense',
    icon: asOptionalString(row.icon),
    color: asOptionalString(row.color),
    sort_order: Number(row.sort_order ?? 0),
    is_archived: Boolean(row.is_archived),
    is_default: Boolean(row.is_default),
    created_at: asString(row.created_at)
  };
}

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

function toPayload(workspaceId: string, input: CategoryFormInput) {
  return {
    workspace_id: workspaceId,
    name: input.name.trim(),
    type: input.type,
    icon: input.icon?.trim() || null,
    color: input.color?.trim() || null,
    sort_order: input.sortOrder ?? 0,
    is_archived: false,
    is_default: false,
    metadata: {}
  };
}

export const CategoryService = {
  async getCategories(workspaceId: string, type: CategoryType): Promise<Category[]> {
    const { data, error } = (await supabase
      .from('categories')
      .select('id, workspace_id, name, type, icon, color, sort_order, is_archived, is_default, created_at')
      .eq('workspace_id', workspaceId)
      .eq('type', type)
      .eq('is_archived', false)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })) as unknown as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil daftar kategori.');

    return (data ?? []).map(mapCategory);
  },

  async getCategory(categoryId: string, workspaceId: string): Promise<Category> {
    const { data, error } = (await supabase
      .from('categories')
      .select('id, workspace_id, name, type, icon, color, sort_order, is_archived, is_default, created_at')
      .eq('id', categoryId)
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil detail kategori.');

    if (!data) {
      throw new Error('Kategori tidak ditemukan.');
    }

    return mapCategory(data);
  },

  async createCategory(workspaceId: string, input: CategoryFormInput): Promise<Category> {
    await this.assertUniqueName(workspaceId, input.type, input.name);

    const { data, error } = (await supabase
      .from('categories')
      .insert(toPayload(workspaceId, input))
      .select('id, workspace_id, name, type, icon, color, sort_order, is_archived, is_default, created_at')
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal membuat kategori.');

    if (!data) {
      throw new Error('Kategori tidak berhasil dibuat.');
    }

    return mapCategory(data);
  },

  async updateCategory(categoryId: string, workspaceId: string, input: CategoryFormInput): Promise<Category> {
    const existing = await this.getCategory(categoryId, workspaceId);
    const nextName = existing.is_default ? existing.name : input.name.trim();
    const nextType = existing.type;

    if (!existing.is_default) {
      await this.assertUniqueName(workspaceId, nextType, nextName, categoryId);
    }

    const payload = existing.is_default
      ? {
          icon: input.icon?.trim() || null,
          color: input.color?.trim() || null
        }
      : {
          name: nextName,
          icon: input.icon?.trim() || null,
          color: input.color?.trim() || null,
          sort_order: input.sortOrder ?? 0
        };

    const { data, error } = (await supabase
      .from('categories')
      .update(payload)
      .eq('id', categoryId)
      .eq('workspace_id', workspaceId)
      .select('id, workspace_id, name, type, icon, color, sort_order, is_archived, is_default, created_at')
      .single()) as unknown as {
      data: Record<string, unknown> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengubah kategori.');

    if (!data) {
      throw new Error('Kategori tidak ditemukan.');
    }

    return mapCategory(data);
  },

  async archiveCategory(categoryId: string, workspaceId: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .update({
        is_archived: true
      })
      .eq('id', categoryId)
      .eq('workspace_id', workspaceId);

    assertSupabaseSuccess(error, 'Gagal mengarsipkan kategori.');
  },

  async assertUniqueName(
    workspaceId: string,
    type: CategoryType,
    name: string,
    excludedCategoryId?: string
  ): Promise<void> {
    const { data, error } = (await supabase
      .from('categories')
      .select('id, name')
      .eq('workspace_id', workspaceId)
      .eq('type', type)
      .is('deleted_at', null)) as unknown as {
      data: Array<Record<string, unknown>> | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal memvalidasi nama kategori.');

    const normalized = normalizeName(name);
    const duplicate = (data ?? []).some(
      (category) =>
        asString(category.id) !== excludedCategoryId && normalizeName(asString(category.name)) === normalized
    );

    if (duplicate) {
      throw new Error('Nama kategori sudah digunakan untuk type yang sama.');
    }
  }
};
