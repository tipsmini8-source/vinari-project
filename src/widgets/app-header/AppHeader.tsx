import { useWorkspace } from '@/core/workspace';
import { ThemeToggle } from '@shared/ui/theme-toggle';

export function AppHeader() {
  const { workspace } = useWorkspace();

  return (
    <header className="fixed inset-x-0 top-0 z-20 h-16 border-b border-border bg-background/95 backdrop-blur lg:left-72">
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{workspace?.name ?? 'Vinari'}</p>
            <p className="hidden text-xs text-muted-foreground sm:block">
              {workspace?.currency_code ?? 'IDR'} workspace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
