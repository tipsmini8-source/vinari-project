import { NavLink } from 'react-router';

import { primaryNavigation, secondaryNavigation } from '@app/config/navigation';
import { dummyWorkspace } from '@app/config/workspace';
import { cn } from '@shared/lib/utils';

function SidebarLink({ href, icon: Icon, label }: (typeof primaryNavigation)[number]) {
  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )
      }
      end={href === '/app'}
      to={href}
    >
      <Icon aria-hidden="true" className="size-4" />
      <span>{label}</span>
    </NavLink>
  );
}

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-border bg-card lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="flex size-9 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
          V
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">Vinari</p>
          <p className="mt-1 text-xs text-muted-foreground">Financial OS</p>
        </div>
      </div>

      <div className="border-b border-border p-4">
        <div className="rounded-md border border-border bg-background p-3">
          <p className="text-xs font-medium text-muted-foreground">Workspace</p>
          <p className="mt-1 truncate text-sm font-semibold">{dummyWorkspace.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{dummyWorkspace.plan}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {primaryNavigation.map((item) => (
            <SidebarLink key={item.href} {...item} />
          ))}
        </div>
        <div className="space-y-1">
          <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Workspace
          </p>
          {secondaryNavigation.map((item) => (
            <SidebarLink key={item.href} {...item} />
          ))}
        </div>
      </nav>
    </aside>
  );
}
