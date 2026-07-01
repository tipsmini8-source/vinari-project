import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { ActionDialog } from '@shared/components/ActionDialog';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';
import { useToast } from '@shared/ui/use-toast';

const roleLabels: Record<string, string> = {
  member: 'Member',
  owner: 'Owner',
  partner: 'Partner',
  viewer: 'Viewer'
};

type WorkspaceSwitcherProps = {
  variant: 'header' | 'compact';
};

export function WorkspaceSwitcher({ variant }: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { setActiveWorkspace, workspace, workspaces } = useWorkspace();
  const { toast } = useToast();

  const handleWorkspaceSelect = async (workspaceId: string) => {
    await setActiveWorkspace(workspaceId);
    setOpen(false);
    toast({ title: 'Ruang keuangan aktif diganti.' });

    if (location.pathname !== '/app') {
      void navigate('/app');
    }
  };

  const currentRole = workspace ? roleLabels[workspace.role] ?? workspace.role : 'Workspace';
  const currentCurrency = workspace?.currency_code ?? 'IDR';

  return (
    <>
      {variant === 'header' ? (
        <button
          className="hidden max-w-full items-center gap-1 rounded-md text-left text-sm font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
          onClick={() => setOpen(true)}
          type="button"
        >
          <span className="truncate">{workspace?.name ?? 'Vinari'}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      ) : (
        <button
          className="flex w-full items-center justify-between gap-3 rounded-[1.15rem] border border-border bg-card px-4 py-3 text-left text-card-foreground shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:hidden"
          onClick={() => setOpen(true)}
          type="button"
        >
          <span className="min-w-0">
            <span className="block text-xs font-medium text-muted-foreground">Ruang Keuangan Aktif</span>
            <span className="mt-0.5 block truncate text-base font-semibold">{workspace?.name ?? 'Vinari'}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {currentRole} - {currentCurrency}
            </span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </button>
      )}

      <ActionDialog
        description="Pilih ruang keuangan yang ingin dibuka"
        onClose={() => setOpen(false)}
        open={open}
        panelClassName="sm:max-w-lg"
        title="Pilih Ruang Keuangan"
      >
        <div className="grid gap-2">
          {workspaces.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-5 text-sm text-muted-foreground">
              Belum ada ruang keuangan aktif.
            </div>
          ) : null}

          {workspaces.map((item) => {
            const active = item.id === workspace?.id;

            return (
              <button
                className={cn(
                  'flex min-h-20 w-full items-center justify-between gap-3 rounded-2xl border bg-background p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active ? 'border-primary/30 bg-primary-soft/70' : 'border-border hover:bg-secondary/60'
                )}
                key={item.id}
                onClick={() => void handleWorkspaceSelect(item.id)}
                type="button"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{item.name}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {roleLabels[item.role] ?? item.role} - {item.currency_code}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {active ? (
                    <>
                      <span className="rounded-full border border-primary/20 bg-card px-2 py-0.5 text-xs font-medium text-primary">
                        Aktif
                      </span>
                      <Check className="size-5 text-primary" />
                    </>
                  ) : null}
                </span>
              </button>
            );
          })}

          <Button asChild className="mt-2 rounded-2xl" variant="outline">
            <Link to="/onboarding">Tambah ruang keuangan</Link>
          </Button>
        </div>
      </ActionDialog>
    </>
  );
}
