import { MoreVertical } from 'lucide-react';
import type { ComponentType } from 'react';
import { useState } from 'react';
import { Link } from 'react-router';

import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';

export type MoreActionMenuItem = {
  destructive?: boolean;
  disabled?: boolean;
  href?: string;
  icon?: ComponentType<{ className?: string }>;
  label: string;
  onSelect?: () => void;
};

type MoreActionMenuProps = {
  actions: MoreActionMenuItem[];
  label: string;
};

export function MoreActionMenu({ actions, label }: MoreActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        aria-expanded={isOpen}
        aria-label={label}
        className="size-9 rounded-full text-muted-foreground"
        onClick={() => setIsOpen((current) => !current)}
        size="icon"
        type="button"
        variant="ghost"
      >
        <MoreVertical className="size-4" />
      </Button>
      {isOpen ? (
        <div className="absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-2xl border border-border bg-popover p-1 text-popover-foreground shadow-xl">
          {actions.map(({ destructive, disabled, href, icon: Icon, label: actionLabel, onSelect }) => {
            const className = cn(
              'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50',
              destructive && 'text-destructive hover:bg-destructive/10'
            );

            if (href) {
              return (
                <Link className={className} key={actionLabel} onClick={() => setIsOpen(false)} to={href}>
                  {Icon ? <Icon className="size-4" /> : null}
                  {actionLabel}
                </Link>
              );
            }

            return (
              <button
                className={className}
                disabled={disabled}
                key={actionLabel}
                onClick={() => {
                  setIsOpen(false);
                  onSelect?.();
                }}
                type="button"
              >
                {Icon ? <Icon className="size-4" /> : null}
                {actionLabel}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
