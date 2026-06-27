import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuth } from '@features/auth';
import { useAdminStatus } from '@features/admin/hooks/useAdmin';
import { GlobalLoading } from '@shared/ui/global-loading';

export function AdminGuard() {
  const location = useLocation();
  const { loading, user } = useAuth();
  const adminStatus = useAdminStatus(Boolean(user) && !loading);

  if (loading || adminStatus.isLoading) {
    return <GlobalLoading />;
  }

  if (!user) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  if (!adminStatus.data) {
    return <Navigate replace to="/app" />;
  }

  return <Outlet />;
}
