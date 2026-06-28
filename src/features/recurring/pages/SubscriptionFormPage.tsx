import { ArrowLeft } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { SubscriptionForm } from '@features/recurring/components/RecurringForms';
import { RecurringErrorState } from '@features/recurring/components/RecurringStates';
import {
  useCreateSubscription,
  useRecurringReferences,
  useSubscription,
  useUpdateSubscription
} from '@features/recurring/hooks/useRecurring';
import type { SubscriptionSubmitInput } from '@features/recurring/types/recurring.types';
import { Button } from '@shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

function canManageRecurring(role: string | undefined) {
  return role === 'owner' || role === 'partner' || role === 'member';
}

export function SubscriptionFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const subscriptionQuery = useSubscription(id, workspace?.id);
  const references = useRecurringReferences(workspace?.id);
  const createSubscription = useCreateSubscription(workspace?.id);
  const updateSubscription = useUpdateSubscription(workspace?.id);

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  if (!canManageRecurring(workspace.role)) {
    return <Navigate replace to="/app/subscriptions" />;
  }

  if ((isEdit && subscriptionQuery.isLoading) || references.isLoading) {
    return <GlobalLoading />;
  }

  const handleSubmit = async (input: SubscriptionSubmitInput) => {
    try {
      if (isEdit && id) {
        await updateSubscription.mutateAsync({ subscriptionId: id, input });
        toast({ title: 'Langganan diperbarui' });
      } else {
        await createSubscription.mutateAsync(input);
        toast({ title: 'Langganan dibuat' });
      }

      void navigate('/app/subscriptions');
    } catch (error) {
      toast({
        title: isEdit ? 'Gagal mengubah langganan' : 'Gagal membuat langganan',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  return (
    <main className="min-h-svh bg-background px-4 py-8 text-foreground">
      <section className="mx-auto w-full max-w-3xl">
        <Button asChild className="mb-4" size="sm" variant="ghost">
          <Link to="/app/subscriptions">
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>

        {(isEdit && subscriptionQuery.isError) || references.isError ? (
          <RecurringErrorState
            message={
              subscriptionQuery.error instanceof Error
                ? subscriptionQuery.error.message
                : references.error instanceof Error
                  ? references.error.message
                  : 'Terjadi kesalahan.'
            }
            onRetry={() => {
              void subscriptionQuery.refetch();
              void references.wallets.refetch();
              void references.categories.refetch();
            }}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{isEdit ? 'Edit Langganan' : 'Tambah Langganan'}</CardTitle>
              <CardDescription>
                Catat biaya rutin seperti internet, BPJS, Netflix, Canva, listrik, atau cicilan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionForm
                categories={references.categories.data ?? []}
                defaultSubscription={subscriptionQuery.data ?? null}
                isSubmitting={createSubscription.isPending || updateSubscription.isPending}
                onCancel={() => void navigate('/app/subscriptions')}
                onSubmit={handleSubmit}
                wallets={references.wallets.data ?? []}
              />
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}
