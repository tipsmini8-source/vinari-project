import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

import { Button } from '@shared/ui/button';

export function RouteErrorBoundary() {
  const error = useRouteError();
  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Terjadi masalah';
  const description =
    isRouteErrorResponse(error) && typeof error.data === 'string'
      ? error.data
      : 'Vinari tidak dapat memuat bagian aplikasi ini.';

  return (
    <div className="grid min-h-svh place-items-center bg-background px-6 text-foreground">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-primary">Vinari</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">{title}</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{String(description)}</p>
        <Button asChild className="mt-8">
          <Link to="/app">Kembali ke App Shell</Link>
        </Button>
      </div>
    </div>
  );
}
