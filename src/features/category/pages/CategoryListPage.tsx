import { ArrowLeft, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { CategoryList } from '@features/category/components/CategoryList';
import { CategoryEmptyState, CategoryErrorState, CategorySkeleton } from '@features/category/components/CategoryStates';
import { useArchiveCategory, useCategories } from '@features/category/hooks/useCategories';
import type { Category, CategoryType } from '@features/category/types/category.types';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

const tabs: Array<{ label: string; value: CategoryType }> = [
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' }
];

function canManageCategories(role: string | undefined) {
  return role === 'owner' || role === 'partner' || role === 'member';
}

export function CategoryListPage() {
  const { loading, workspace } = useWorkspace();
  const [activeType, setActiveType] = useState<CategoryType>('expense');
  const { toast } = useToast();
  const categoriesQuery = useCategories(workspace?.id, activeType);
  const archiveCategory = useArchiveCategory(workspace?.id);
  const canManage = canManageCategories(workspace?.role);

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  const handleArchive = async (category: Category) => {
    const confirmed = window.confirm(`Arsipkan kategori "${category.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await archiveCategory.mutateAsync(category.id);
      toast({ title: 'Kategori diarsipkan' });
    } catch (error) {
      toast({
        title: 'Gagal mengarsipkan kategori',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  return (
    <main className="min-h-svh bg-background px-4 py-8 text-foreground">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button asChild className="mb-3" size="sm" variant="ghost">
              <Link to="/app">
                <ArrowLeft className="size-4" />
                Kembali
              </Link>
            </Button>
            <p className="text-sm font-medium text-primary">{workspace.name}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Kategori</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Kelola kategori income dan expense untuk transaksi, budget, dan laporan.
            </p>
          </div>
          {canManage ? (
            <Button asChild>
              <Link to="/app/categories/new">
                <Plus className="size-4" />
                Tambah Kategori
              </Link>
            </Button>
          ) : null}
        </div>

        <div className="mb-4 grid grid-cols-2 rounded-md border border-border bg-card p-1">
          {tabs.map((tab) => (
            <Button
              className={cn(activeType === tab.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}
              key={tab.value}
              onClick={() => setActiveType(tab.value)}
              type="button"
              variant={activeType === tab.value ? 'default' : 'ghost'}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {categoriesQuery.isLoading ? <CategorySkeleton /> : null}

        {categoriesQuery.isError ? (
          <CategoryErrorState
            message={categoriesQuery.error instanceof Error ? categoriesQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void categoriesQuery.refetch()}
          />
        ) : null}

        {!categoriesQuery.isLoading && !categoriesQuery.isError && (categoriesQuery.data ?? []).length === 0 ? (
          <CategoryEmptyState canCreate={canManage} />
        ) : null}

        {!categoriesQuery.isLoading && !categoriesQuery.isError && (categoriesQuery.data ?? []).length > 0 ? (
          <CategoryList
            canManage={canManage}
            categories={categoriesQuery.data ?? []}
            onArchive={handleArchive}
          />
        ) : null}
      </section>
    </main>
  );
}
