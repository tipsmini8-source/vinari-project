import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { SettingsService } from '@features/settings/services/settings.service';
import type {
  PreferencesSubmitInput,
  ProfileSubmitInput,
  WorkspaceSettingsSubmitInput
} from '@features/settings/types/settings.types';

export const settingsKeys = {
  preferences: (userId: string | undefined) => ['settings-preferences', userId] as const,
  profile: (userId: string | undefined) => ['settings-profile', userId] as const,
  workspace: (workspaceId: string | undefined) => ['settings-workspace', workspaceId] as const
};

export function useSettingsProfile(userId: string | undefined) {
  return useQuery({
    enabled: Boolean(userId),
    queryKey: settingsKeys.profile(userId),
    queryFn: () => {
      if (!userId) {
        throw new Error('User aktif tidak ditemukan.');
      }

      return SettingsService.getProfile(userId);
    }
  });
}

export function useUpdateSettingsProfile(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProfileSubmitInput) => {
      if (!userId) {
        throw new Error('User aktif tidak ditemukan.');
      }

      return SettingsService.updateProfile(userId, input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: settingsKeys.profile(userId) });
    }
  });
}

export function useSettingsPreferences(userId: string | undefined) {
  return useQuery({
    enabled: Boolean(userId),
    queryKey: settingsKeys.preferences(userId),
    queryFn: () => {
      if (!userId) {
        throw new Error('User aktif tidak ditemukan.');
      }

      return SettingsService.getPreferences(userId);
    }
  });
}

export function useUpdateSettingsPreferences(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PreferencesSubmitInput) => {
      if (!userId) {
        throw new Error('User aktif tidak ditemukan.');
      }

      return SettingsService.updatePreferences(userId, input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: settingsKeys.preferences(userId) });
    }
  });
}

export function useWorkspaceSettings(workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: settingsKeys.workspace(workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return SettingsService.getWorkspaceSettings(workspaceId);
    }
  });
}

export function useUpdateWorkspaceSettings(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: WorkspaceSettingsSubmitInput) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return SettingsService.updateWorkspaceName(workspaceId, input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: settingsKeys.workspace(workspaceId) });
    }
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => SettingsService.requestPasswordReset(email)
  });
}

export function useSettingsLogout() {
  return useMutation({
    mutationFn: () => SettingsService.logout()
  });
}

export function useLogoutAllSessions() {
  return useMutation({
    mutationFn: () => SettingsService.logoutAllSessions()
  });
}
