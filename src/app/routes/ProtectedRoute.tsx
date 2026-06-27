import { Navigate, Outlet, useLocation } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { useAuth } from '@features/auth';
import { GlobalLoading } from '@shared/ui/global-loading';

export function ProtectedRoute() {
  const location = useLocation();
  const { loading, user } = useAuth();
  const { loading: workspaceLoading, workspace } = useWorkspace();

  if (loading || workspaceLoading) {
    return <GlobalLoading />;
  }

  if (!user) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  if (location.pathname === '/onboarding' && workspace) {
    return <Navigate replace to="/app" />;
  }

  if (location.pathname !== '/onboarding' && !workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  return <Outlet />;
}
