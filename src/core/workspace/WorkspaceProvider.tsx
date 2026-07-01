import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { useAuth } from '@features/auth';
import { WorkspaceContext } from '@/core/workspace/WorkspaceContext';
import { WorkspaceService } from '@/core/workspace/WorkspaceService';
import { workspaceKeys } from '@/core/workspace/workspace.keys';
import type { WorkspaceContextValue } from '@/core/workspace/workspace.types';

export function WorkspaceProvider({ children }: PropsWithChildren) {
  const { loading: authLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => WorkspaceService.getStoredActiveWorkspaceId());

  const workspacesQuery = useQuery({
    enabled: Boolean(user?.id) && !authLoading,
    queryKey: workspaceKeys.list(user?.id),
    queryFn: () => {
      if (!user?.id) {
        return [];
      }

      return WorkspaceService.getWorkspaces(user.id);
    },
    retry: 1
  });

  const workspaces = useMemo(() => workspacesQuery.data ?? [], [workspacesQuery.data]);
  const activeWorkspace = useMemo(() => {
    if (workspaces.length === 0) {
      return null;
    }

    return workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? workspaces[0];
  }, [activeWorkspaceId, workspaces]);

  useEffect(() => {
    if (authLoading || workspacesQuery.isLoading || workspacesQuery.isFetching) {
      return;
    }

    const selectedWorkspace = WorkspaceService.selectActiveWorkspace(workspaces);
    const nextActiveWorkspaceId = selectedWorkspace?.id ?? null;

    if (nextActiveWorkspaceId !== activeWorkspaceId) {
      setActiveWorkspaceId(nextActiveWorkspaceId);
    }
  }, [activeWorkspaceId, authLoading, workspaces, workspacesQuery.isFetching, workspacesQuery.isLoading]);

  const refreshWorkspace = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: workspaceKeys.list(user?.id) });
    await queryClient.invalidateQueries({ queryKey: workspaceKeys.active(user?.id) });
  }, [queryClient, user?.id]);

  const setActiveWorkspace = useCallback(
    async (workspaceId: string) => {
      WorkspaceService.setStoredActiveWorkspaceId(workspaceId);
      setActiveWorkspaceId(workspaceId);
      await queryClient.invalidateQueries();
    },
    [queryClient]
  );

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspace: activeWorkspace,
      workspaces,
      loading: authLoading || workspacesQuery.isLoading || workspacesQuery.isFetching,
      error: workspacesQuery.error instanceof Error ? workspacesQuery.error : null,
      refreshWorkspace,
      setActiveWorkspace
    }),
    [
      activeWorkspace,
      authLoading,
      refreshWorkspace,
      setActiveWorkspace,
      workspaces,
      workspacesQuery.error,
      workspacesQuery.isFetching,
      workspacesQuery.isLoading
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
