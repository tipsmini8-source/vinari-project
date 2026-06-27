import { NavLink } from 'react-router';

import { appNavigation } from '@app/config/navigation';
import { cn } from '@shared/lib/utils';

export function AppBottomNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur lg:hidden">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {appNavigation.map(({ href, icon: Icon, label }) => (
          <NavLink
            key={href}
            className={({ isActive }) =>
              cn(
                'flex h-14 min-w-20 flex-col items-center justify-center gap-1 rounded-md px-2 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
            end={href === '/app'}
            to={href}
          >
            <Icon aria-hidden="true" className="size-5" />
            <span className="max-w-full truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
