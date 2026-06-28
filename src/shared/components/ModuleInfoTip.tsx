import type { ReactNode } from 'react';

type ModuleInfoTipProps = {
  children: ReactNode;
};

export function ModuleInfoTip({ children }: ModuleInfoTipProps) {
  return (
    <p className="mt-5 rounded-2xl border border-border/80 bg-muted/45 px-4 py-3 text-sm leading-6 text-muted-foreground">
      {children}
    </p>
  );
}
