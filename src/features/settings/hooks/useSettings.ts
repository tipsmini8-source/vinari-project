import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { SettingsService } from '@features/settings/services/settings.service';
import type {
  MemberInviteSubmitInput,
  PreferencesSubmitInput,
  ProfileSubmitInput,
  WorkspaceMemberRole,
  WorkspaceSettingsSubmitInput
} from '@features/settings/types/settings.types';

export const settingsKeys = {
  invitations: (email: string | undefined) => ['settings-invitations', email] as const,
  members: (workspaceId: string | undefined) => ['settings-members', workspaceId] as const,
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

export function useWorkspaceMembers(workspaceId: string | undefined) {
  return useQuery({
    enabled: Boolean(workspaceId),
    queryKey: settingsKeys.members(workspaceId),
    queryFn: () => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return SettingsService.getWorkspaceMembers(workspaceId);
    }
  });
}

export function useWorkspaceInvitations(email: string | undefined) {
  return useQuery({
    enabled: Boolean(email),
    queryKey: settingsKeys.invitations(email),
    queryFn: () => {
      if (!email) {
        throw new Error('Email user aktif tidak ditemukan.');
      }

      return SettingsService.getWorkspaceInvitations(email);
    }
  });
}

export function useInviteWorkspaceMember(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MemberInviteSubmitInput) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      return SettingsService.inviteWorkspaceMember(workspaceId, input);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: settingsKeys.members(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: settingsKeys.workspace(workspaceId) })
      ]);
    }
  });
}

export function useUpdateWorkspaceMemberRole(workspaceId: string | undefined, currentUserId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: WorkspaceMemberRole }) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      if (!currentUserId) {
        throw new Error('User aktif tidak ditemukan.');
      }

      return SettingsService.updateWorkspaceMemberRole(workspaceId, memberId, currentUserId, role);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: settingsKeys.members(workspaceId) });
    }
  });
}

export function useRemoveWorkspaceMember(workspaceId: string | undefined, currentUserId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => {
      if (!workspaceId) {
        throw new Error('Workspace aktif tidak ditemukan.');
      }

      if (!currentUserId) {
        throw new Error('User aktif tidak ditemukan.');
      }

      return SettingsService.removeWorkspaceMember(workspaceId, memberId, currentUserId);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: settingsKeys.members(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: settingsKeys.workspace(workspaceId) })
      ]);
    }
  });
}

export function useAcceptWorkspaceInvitation(workspaceId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => SettingsService.acceptWorkspaceInvitation(invitationId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['settings-invitations'] }),
        queryClient.invalidateQueries({ queryKey: settingsKeys.members(workspaceId) }),
        queryClient.invalidateQueries({ queryKey: settingsKeys.workspace(workspaceId) })
      ]);
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
