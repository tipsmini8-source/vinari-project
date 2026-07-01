import { Navigate, Outlet, useLocation } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { useAuth } from '@features/auth';
import { GlobalLoading } from '@shared/ui/global-loading';

export function PublicRoute() {
  const location = useLocation();
  const { loading, user } = useAuth();
  const { loading: workspaceLoading, workspace } = useWorkspace();

  if (loading) {
    return <GlobalLoading />;
  }

  if (user) {
    const inviteToken = new URLSearchParams(location.search).get('invite');

    if (inviteToken) {
      return <Navigate replace to={`/invite/${inviteToken}`} />;
    }

    if (workspaceLoading) {
      return <GlobalLoading />;
    }

    return <Navigate replace to={workspace ? '/app' : '/onboarding'} />;
  }

  return <Outlet />;
}
