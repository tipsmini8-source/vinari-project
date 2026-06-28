import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { useAuth } from '@features/auth';
import { PreferencesForm } from '@features/settings/components/SettingsForms';
import { SettingsErrorState, SettingsSectionCard, SettingsSkeleton } from '@features/settings/components/SettingsStates';
import { useSettingsPreferences, useUpdateSettingsPreferences } from '@features/settings/hooks/useSettings';
import type { PreferencesSubmitInput } from '@features/settings/types/settings.types';
import { appTemplates, type AppTemplate, type AppTemplateId } from '@shared/theme/app-templates';
import { useAppTemplate } from '@shared/theme/use-app-template';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

const templateOptions = [appTemplates.tech_premium, appTemplates.fintech_fresh];

export function PreferencesSettingsPage() {
  const { user } = useAuth();
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const preferencesQuery = useSettingsPreferences(user?.id);
  const updatePreferences = useUpdateSettingsPreferences(user?.id);
  const { activeTemplate, isUpdating, updateTemplate } = useAppTemplate();

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

  const handleTemplateSelect = async (templateId: AppTemplateId) => {
    try {
      await updateTemplate(templateId);
      toast({ title: 'Template tampilan diperbarui' });
    } catch (error) {
      toast({
        title: 'Gagal mengganti template',
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
          <div className="space-y-4">
            <SettingsSectionCard
              description="Atur tampilan aplikasi sesuai selera kamu."
              title="Template Tampilan"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {templateOptions.map((template) => (
                  <TemplateOptionCard
                    isActive={activeTemplate.id === template.id}
                    isSubmitting={isUpdating}
                    key={template.id}
                    onSelect={handleTemplateSelect}
                    template={template}
                  />
                ))}
              </div>
            </SettingsSectionCard>

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
          </div>
        ) : null}
      </section>
    </main>
  );
}

function TemplateOptionCard({
  isActive,
  isSubmitting,
  onSelect,
  template
}: {
  isActive: boolean;
  isSubmitting: boolean;
  onSelect: (templateId: AppTemplateId) => Promise<void>;
  template: AppTemplate;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div
        className="h-20 rounded-2xl"
        style={{ background: template.heroGradient }}
      />
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{template.name}</h2>
            {template.id === 'tech_premium' ? (
              <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary">
                Default
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{template.description}</p>
        </div>
        {isActive ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" /> : null}
      </div>
      <Button
        className="mt-4 w-full rounded-xl"
        disabled={isSubmitting || isActive}
        onClick={() => void onSelect(template.id)}
        type="button"
        variant={isActive ? 'secondary' : 'default'}
      >
        {isSubmitting && !isActive ? <Loader2 className="size-4 animate-spin" /> : null}
        {isActive ? 'Sedang Dipakai' : 'Pilih'}
      </Button>
    </article>
  );
}
