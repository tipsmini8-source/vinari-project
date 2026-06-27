import { ArrowLeft } from 'lucide-react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { useAuth } from '@features/auth';
import { ProfileForm } from '@features/settings/components/SettingsForms';
import { SettingsErrorState, SettingsSectionCard, SettingsSkeleton } from '@features/settings/components/SettingsStates';
import { useSettingsProfile, useUpdateSettingsProfile } from '@features/settings/hooks/useSettings';
import type { ProfileSubmitInput } from '@features/settings/types/settings.types';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

export function ProfileSettingsPage() {
  const { user } = useAuth();
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const profileQuery = useSettingsProfile(user?.id);
  const updateProfile = useUpdateSettingsProfile(user?.id);

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  const handleSubmit = async (input: ProfileSubmitInput) => {
    try {
      await updateProfile.mutateAsync(input);
      toast({ title: 'Profil disimpan' });
    } catch (error) {
      toast({
        title: 'Gagal menyimpan profil',
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

        {profileQuery.isLoading ? <SettingsSkeleton /> : null}

        {profileQuery.isError ? (
          <SettingsErrorState
            message={profileQuery.error instanceof Error ? profileQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void profileQuery.refetch()}
          />
        ) : null}

        {profileQuery.data ? (
          <SettingsSectionCard
            description="Update informasi akun yang dipakai Vinari."
            title="Profil"
          >
            <ProfileForm
              defaultProfile={profileQuery.data}
              isSubmitting={updateProfile.isPending}
              onSubmit={handleSubmit}
            />
          </SettingsSectionCard>
        ) : null}
      </section>
    </main>
  );
}
