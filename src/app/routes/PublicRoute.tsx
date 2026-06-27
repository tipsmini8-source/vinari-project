import { Navigate, Outlet } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { useAuth } from '@features/auth';
import { GlobalLoading } from '@shared/ui/global-loading';

export function PublicRoute() {
  const { loading, user } = useAuth();
  const { loading: workspaceLoading, workspace } = useWorkspace();

  if (loading) {
    return <GlobalLoading />;
  }

  if (user) {
    if (workspaceLoading) {
      return <GlobalLoading />;
    }

    return <Navigate replace to={workspace ? '/app' : '/onboarding'} />;
  }

  return <Outlet />;
}
