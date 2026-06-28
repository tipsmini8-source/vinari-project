import { Link, useLocation } from 'react-router';

import { isNavigationActive, mainNavigation, type NavigationGroup, type NavigationItem } from '@app/config/navigation';
import { useWorkspace } from '@/core/workspace';
import { cn } from '@shared/lib/utils';

function SidebarLink({ href, icon: Icon, label, matches }: NavigationItem) {
  const { pathname } = useLocation();
  const active = isNavigationActive(pathname, { href, matches });

  return (
    <Link
      className={cn(
        'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
      to={href}
    >
      <Icon aria-hidden="true" className="size-4" />
      <span>{label}</span>
    </Link>
  );
}

function SidebarGroup({ group }: { group: NavigationGroup }) {
  const { pathname } = useLocation();
  const active = isNavigationActive(pathname, group);
  const Icon = group.icon;

  return (
    <div className={cn('rounded-xl border border-border bg-background p-2', active && 'border-primary/40 bg-primary-soft/60')}>
      <Link
        className={cn(
          'flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent hover:text-accent-foreground',
          active && 'text-primary'
        )}
        to={group.href}
      >
        <span
          className={cn(
            'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground',
            active && 'bg-primary text-primary-foreground'
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold">{group.label}</span>
          <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{group.description}</span>
        </span>
      </Link>

      {group.children && active ? (
        <div className="mt-1 grid gap-1 pl-12">
          {group.children.map((child) => (
            <SidebarLink key={child.href} {...child} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AppSidebar() {
  const { workspace } = useWorkspace();
  const roleLabels: Record<string, string> = {
    member: 'Anggota',
    owner: 'Pemilik',
    partner: 'Partner',
    viewer: 'Lihat saja'
  };

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
          <p className="text-xs font-medium text-muted-foreground">Ruang Keuangan</p>
          <p className="mt-1 truncate text-sm font-semibold">{workspace?.name ?? 'Vinari'}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {workspace?.role ? `${roleLabels[workspace.role] ?? workspace.role} - ${workspace.currency_code}` : 'Ruang aktif'}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {mainNavigation.map((group) => (
          <SidebarGroup group={group} key={group.href} />
        ))}
      </nav>
    </aside>
  );
}
