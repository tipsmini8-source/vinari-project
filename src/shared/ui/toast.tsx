import { useCallback, useMemo, useState, type PropsWithChildren } from 'react';
import { X } from 'lucide-react';

import { Button } from '@shared/ui/button';
import { cn } from '@shared/lib/utils';
import { ToastContext, type ToastInput, type ToastVariant } from '@shared/ui/toast-context';

type ToastItem = ToastInput & {
  id: string;
  variant: ToastVariant;
};

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = crypto.randomUUID();
      const item: ToastItem = {
        id,
        title: input.title,
        description: input.description,
        variant: input.variant ?? 'default'
      };

      setToasts((current) => [...current, item]);
      window.setTimeout(() => dismiss(id), 5000);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((item) => (
          <div
            className={cn(
              'rounded-md border bg-card p-4 text-card-foreground shadow-lg',
              item.variant === 'destructive' && 'border-destructive bg-destructive text-destructive-foreground'
            )}
            key={item.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold">{item.title}</p>
                {item.description ? <p className="text-sm opacity-90">{item.description}</p> : null}
              </div>
              <Button
                aria-label="Tutup notifikasi"
                className="size-7"
                onClick={() => dismiss(item.id)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
