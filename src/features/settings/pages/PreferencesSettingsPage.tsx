import { ArrowLeft } from 'lucide-react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { useAuth } from '@features/auth';
import { PreferencesForm } from '@features/settings/components/SettingsForms';
import { SettingsErrorState, SettingsSectionCard, SettingsSkeleton } from '@features/settings/components/SettingsStates';
import { useSettingsPreferences, useUpdateSettingsPreferences } from '@features/settings/hooks/useSettings';
import type { PreferencesSubmitInput } from '@features/settings/types/settings.types';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

export function PreferencesSettingsPage() {
  const { user } = useAuth();
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const preferencesQuery = useSettingsPreferences(user?.id);
  const updatePreferences = useUpdateSettingsPreferences(user?.id);

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  const handleSubmit = async (input: PreferencesSubmitInput) => {
    try {
      await updatePreferences.mutateAsync(input);
      toast({ title: 'Preferensi disimpan' });
    } catch (error) {
      toast({
        title: 'Gagal menyimpan preferensi',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  return (
    <main className="min-h-svh bg-background px-4 py-8 text-foreground">
      <section className="mx-auto w-full max-w-3xl">
        <Button asChild className="mb-4" size="sm" variant="ghost">
          <Link to="/app/settings">
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>

        {preferencesQuery.isLoading ? <SettingsSkeleton /> : null}

        {preferencesQuery.isError ? (
          <SettingsErrorState
            message={preferencesQuery.error instanceof Error ? preferencesQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void preferencesQuery.refetch()}
          />
        ) : null}

        {preferencesQuery.data ? (
          <SettingsSectionCard
            description="Atur preferensi tampilan dan notifikasi aplikasi."
            title="Preferensi"
          >
            <PreferencesForm
              defaultPreferences={preferencesQuery.data}
              isSubmitting={updatePreferences.isPending}
              onSubmit={handleSubmit}
            />
          </SettingsSectionCard>
        ) : null}
      </section>
    </main>
  );
}
