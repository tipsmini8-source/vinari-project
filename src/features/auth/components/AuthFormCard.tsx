import type { PropsWithChildren, ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';

type AuthFormCardProps = PropsWithChildren<{
  title: string;
  description: string;
  footer?: ReactNode;
}>;

export function AuthFormCard({ children, description, footer, title }: AuthFormCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
        {footer ? <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}
