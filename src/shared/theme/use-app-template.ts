import { createContext, createElement, useContext, useEffect, useMemo, type PropsWithChildren } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@features/auth';
import { SettingsService } from '@features/settings/services/settings.service';
import { settingsKeys, useSettingsPreferences } from '@features/settings/hooks/useSettings';
import { useThemeStore } from '@shared/stores/theme-store';
import {
  defaultAppTemplate,
  getAppTemplate,
  getTemplateModeColors,
  type AppTemplate,
  type AppTemplateId,
  type AppTemplateModeColors
} from './app-templates';

type AppTemplateContextValue = {
  activeTemplate: AppTemplate;
  activeColors: AppTemplateModeColors;
  isUpdating: boolean;
  updateTemplate: (templateId: AppTemplateId) => Promise<void>;
};

const AppTemplateContext = createContext<AppTemplateContextValue>({
  activeColors: defaultAppTemplate.colors.light,
  activeTemplate: defaultAppTemplate,
  isUpdating: false,
  updateTemplate: async () => undefined
});

function useResolvedDarkMode() {
  const theme = useThemeStore((state) => state.theme);

  if (typeof window === 'undefined') {
    return false;
  }

  return theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

export function AppTemplateProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const preferencesQuery = useSettingsPreferences(user?.id);
  const isDark = useResolvedDarkMode();
  const activeTemplate = getAppTemplate(preferencesQuery.data?.app_template);
  const activeColors = getTemplateModeColors(activeTemplate, isDark);

  const updateMutation = useMutation({
    mutationFn: (templateId: AppTemplateId) => {
      if (!user?.id) {
        throw new Error('User aktif tidak ditemukan.');
      }

      return SettingsService.updateAppTemplate(user.id, templateId);
    },
    onSuccess: async (preferences) => {
      queryClient.setQueryData(settingsKeys.preferences(user?.id), preferences);
      await queryClient.invalidateQueries({ queryKey: settingsKeys.preferences(user?.id) });
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.dataset.appTemplate = activeTemplate.id;
    root.style.setProperty('--template-primary', activeColors.primaryColor);
    root.style.setProperty('--template-accent', activeColors.accentColor);
    root.style.setProperty('--template-soft', activeColors.softBackground);
    root.style.setProperty('--template-icon-soft', activeColors.iconSoftBackground);
    root.style.setProperty('--template-nav-active', activeColors.navActiveColor);
    root.style.setProperty('--template-card-accent', activeColors.cardAccent);
    root.style.setProperty('--template-success', activeColors.successColor);
    root.style.setProperty('--template-danger', activeColors.dangerColor);
    root.style.setProperty('--template-warning', activeColors.warningColor);
  }, [activeColors, activeTemplate.id]);

  const value = useMemo<AppTemplateContextValue>(
    () => ({
      activeColors,
      activeTemplate,
      isUpdating: updateMutation.isPending,
      updateTemplate: async (templateId) => {
        await updateMutation.mutateAsync(templateId);
      }
    }),
    [activeColors, activeTemplate, updateMutation]
  );

  return createElement(AppTemplateContext.Provider, { value }, children);
}

export function useAppTemplate() {
  return useContext(AppTemplateContext);
}
