import { Outlet } from 'react-router';

import { AppBottomNavigation } from '@widgets/app-bottom-navigation/AppBottomNavigation';
import { AppHeader } from '@widgets/app-header/AppHeader';
import { AppSidebar } from '@widgets/app-sidebar/AppSidebar';
import { WorkspaceSwitcher } from '@widgets/workspace-switcher/WorkspaceSwitcher';

export function DashboardLayout() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <AppSidebar />
      <div className="min-h-svh lg:pl-72">
        <AppHeader />
        <div className="pb-24 pt-16 lg:pb-8">
          <div className="px-4 pb-1 pt-4 sm:hidden">
            <WorkspaceSwitcher variant="compact" />
          </div>
          <Outlet />
        </div>
      </div>
      <AppBottomNavigation />
    </div>
  );
}
