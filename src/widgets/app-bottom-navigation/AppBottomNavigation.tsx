import { Link, useLocation } from 'react-router';

import { appNavigation, isNavigationActive } from '@app/config/navigation';
import { cn } from '@shared/lib/utils';

export function AppBottomNavigation() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur lg:hidden">
      <div className="grid grid-cols-5 gap-1 pb-1">
        {appNavigation.map(({ href, icon: Icon, label, matches }) => (
          <Link
            key={href}
            className={cn(
              'flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-medium transition-colors',
              isNavigationActive(pathname, { href, matches })
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
            to={href}
          >
            <Icon aria-hidden="true" className="size-5" />
            <span className="max-w-full truncate">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
