import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, type PropsWithChildren } from 'react';

import { useAuth } from '@features/auth';
import { WorkspaceContext } from '@/core/workspace/WorkspaceContext';
import { WorkspaceService } from '@/core/workspace/WorkspaceService';
import { workspaceKeys } from '@/core/workspace/workspace.keys';
import type { WorkspaceContextValue } from '@/core/workspace/workspace.types';

export function WorkspaceProvider({ children }: PropsWithChildren) {
  const { loading: authLoading, user } = useAuth();
  const queryClient = useQueryClient();

  const workspaceQuery = useQuery({
    enabled: Boolean(user?.id) && !authLoading,
    queryKey: workspaceKeys.active(user?.id),
    queryFn: () => {
      if (!user?.id) {
        return null;
      }

      return WorkspaceService.getFirstWorkspace(user.id);
    },
    retry: 1
  });

  const refreshWorkspace = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: workspaceKeys.active(user?.id) });
  }, [queryClient, user?.id]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspace: workspaceQuery.data ?? null,
      loading: authLoading || workspaceQuery.isLoading || workspaceQuery.isFetching,
      error: workspaceQuery.error instanceof Error ? workspaceQuery.error : null,
      refreshWorkspace
    }),
    [
      authLoading,
      refreshWorkspace,
      workspaceQuery.data,
      workspaceQuery.error,
      workspaceQuery.isFetching,
      workspaceQuery.isLoading
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
