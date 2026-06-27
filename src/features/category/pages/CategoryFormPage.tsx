import { ArrowLeft } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { CategoryForm } from '@features/category/components/CategoryForm';
import { CategoryErrorState } from '@features/category/components/CategoryStates';
import { useCategory, useCreateCategory, useUpdateCategory } from '@features/category/hooks/useCategories';
import type { CategorySubmitInput } from '@features/category/types/category.types';
import { Button } from '@shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

function canManageCategories(role: string | undefined) {
  return role === 'owner' || role === 'partner' || role === 'member';
}

export function CategoryFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const categoryQuery = useCategory(id, workspace?.id);
  const createCategory = useCreateCategory(workspace?.id);
  const updateCategory = useUpdateCategory(workspace?.id);

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  if (!canManageCategories(workspace.role)) {
    return <Navigate replace to="/app/categories" />;
  }

  if (isEdit && categoryQuery.isLoading) {
    return <GlobalLoading />;
  }

  const handleSubmit = async (input: CategorySubmitInput) => {
    try {
      if (isEdit && id) {
        await updateCategory.mutateAsync({ categoryId: id, input });
        toast({ title: 'Kategori diperbarui' });
      } else {
        await createCategory.mutateAsync(input);
        toast({ title: 'Kategori dibuat' });
      }

      void navigate('/app/categories');
    } catch (error) {
      toast({
        title: isEdit ? 'Gagal mengubah kategori' : 'Gagal membuat kategori',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  return (
    <main className="min-h-svh bg-background px-4 py-8 text-foreground">
      <section className="mx-auto w-full max-w-3xl">
        <Button asChild className="mb-4" size="sm" variant="ghost">
          <Link to="/app/categories">
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>

        {isEdit && categoryQuery.isError ? (
          <CategoryErrorState
            message={categoryQuery.error instanceof Error ? categoryQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void categoryQuery.refetch()}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{isEdit ? 'Edit Kategori' : 'Tambah Kategori'}</CardTitle>
              <CardDescription>
                Kategori aktif akan muncul di form transaksi dan kategori expense dapat dipakai untuk budget.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryForm
                defaultCategory={categoryQuery.data ?? null}
                isSubmitting={createCategory.isPending || updateCategory.isPending}
                onCancel={() => void navigate('/app/categories')}
                onSubmit={handleSubmit}
              />
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}
