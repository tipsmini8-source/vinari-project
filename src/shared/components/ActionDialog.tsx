import { X } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@shared/ui/button';

type ActionDialogProps = {
  children: ReactNode;
  description?: string;
  onClose: () => void;
  open: boolean;
  title: string;
};

export function ActionDialog({ children, description, onClose, open, title }: ActionDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92svh] w-full overflow-y-auto rounded-t-3xl border border-border bg-background p-5 text-foreground shadow-2xl sm:max-w-xl sm:rounded-3xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-normal">{title}</h2>
            {description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p> : null}
          </div>
          <Button aria-label="Tutup" className="rounded-full" onClick={onClose} size="icon" type="button" variant="ghost">
            <X className="size-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
