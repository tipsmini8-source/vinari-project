import { Search } from 'lucide-react';

import { dummyWorkspace } from '@app/config/workspace';
import { Button } from '@shared/ui/button';
import { ThemeToggle } from '@shared/ui/theme-toggle';

export function AppHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-20 h-16 border-b border-border bg-background/95 backdrop-blur lg:left-72">
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{dummyWorkspace.name}</p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              App Shell siap untuk modul finansial Vinari
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button aria-label="Pencarian global" size="icon" type="button" variant="ghost">
            <Search aria-hidden="true" className="size-5" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
