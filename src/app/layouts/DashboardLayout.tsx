import { Outlet } from 'react-router';

import { AppBottomNavigation } from '@widgets/app-bottom-navigation/AppBottomNavigation';
import { AppHeader } from '@widgets/app-header/AppHeader';
import { AppSidebar } from '@widgets/app-sidebar/AppSidebar';

export function DashboardLayout() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <AppSidebar />
      <div className="min-h-svh lg:pl-72">
        <AppHeader />
        <main className="pb-24 pt-16 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <AppBottomNavigation />
    </div>
  );
}
