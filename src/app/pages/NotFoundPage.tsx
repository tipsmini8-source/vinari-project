import { Link } from 'react-router';

import { Button } from '@shared/ui/button';

export function NotFoundPage() {
  return (
    <div className="grid min-h-svh place-items-center bg-background px-6 text-foreground">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Halaman tidak ditemukan</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Route ini belum tersedia di App Shell Vinari.
        </p>
        <Button asChild className="mt-8">
          <Link to="/app">Kembali ke App Shell</Link>
        </Button>
      </div>
    </div>
  );
}
