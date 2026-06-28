import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { Button } from '@shared/ui/button';

type SectionHeaderActionProps = {
  action?: ReactNode;
  backHref?: string;
  description: string;
  eyebrow?: string;
  title: string;
};

export function SectionHeaderAction({
  action,
  backHref = '/app',
  description,
  eyebrow,
  title
}: SectionHeaderActionProps) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <Button asChild className="mb-3" size="sm" variant="ghost">
          <Link to={backHref}>
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>
        {eyebrow ? <p className="text-sm font-medium text-primary">{eyebrow}</p> : null}
        <h1 className="mt-1 text-3xl font-semibold tracking-normal">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
