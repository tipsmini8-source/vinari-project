import { ArrowLeft } from 'lucide-react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { useAuth } from '@features/auth';
import { WorkspaceNameForm } from '@features/settings/components/SettingsForms';
import { SettingsErrorState, SettingsSectionCard, SettingsSkeleton } from '@features/settings/components/SettingsStates';
import { useUpdateWorkspaceSettings, useWorkspaceSettings } from '@features/settings/hooks/useSettings';
import type { WorkspaceSettingsSubmitInput } from '@features/settings/types/settings.types';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

export function WorkspaceSettingsPage() {
  const { user } = useAuth();
  const { loading, refreshWorkspace, workspace } = useWorkspace();
  const { toast } = useToast();
  const workspaceQuery = useWorkspaceSettings(workspace?.id);
  const updateWorkspace = useUpdateWorkspaceSettings(workspace?.id);

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  const canEditWorkspace = workspace.role === 'owner';

  const handleSubmit = async (input: WorkspaceSettingsSubmitInput) => {
    try {
      await updateWorkspace.mutateAsync(input);
      await refreshWorkspace();
      toast({ title: 'Workspace disimpan' });
    } catch (error) {
      toast({
        title: 'Gagal menyimpan workspace',
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

        {workspaceQuery.isLoading ? <SettingsSkeleton /> : null}

        {workspaceQuery.isError ? (
          <SettingsErrorState
            message={workspaceQuery.error instanceof Error ? workspaceQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void workspaceQuery.refetch()}
          />
        ) : null}

        {workspaceQuery.data ? (
          <div className="space-y-4">
            <SettingsSectionCard
              description="Informasi workspace aktif dan role Anda."
              title="Workspace"
            >
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Tipe workspace</p>
                  <p className="font-medium capitalize">{workspaceQuery.data.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Mata uang</p>
                  <p className="font-medium">{workspaceQuery.data.currency_code}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{workspace.role}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Jumlah member</p>
                  <p className="font-medium">{workspaceQuery.data.member_count}</p>
                </div>
              </div>
            </SettingsSectionCard>

            <SettingsSectionCard
              description={
                canEditWorkspace
                  ? 'Owner dapat mengubah nama workspace.'
                  : 'Hanya owner workspace yang dapat mengubah nama workspace.'
              }
              title="Nama Workspace"
            >
              <WorkspaceNameForm
                canEdit={canEditWorkspace}
                defaultWorkspace={{
                  ...workspaceQuery.data,
                  role: workspace.role
                }}
                isSubmitting={updateWorkspace.isPending}
                onSubmit={handleSubmit}
              />
            </SettingsSectionCard>
          </div>
        ) : null}
      </section>
    </main>
  );
}
