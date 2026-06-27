import { Link } from 'react-router';

import { Button } from '@shared/ui/button';

export function OnboardingPlaceholderPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 text-foreground">
      <section className="w-full max-w-md rounded-md border border-border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm font-medium text-primary">Vinari</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal">Onboarding</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Placeholder onboarding sudah tersedia untuk redirect setelah login.
        </p>
        <Button asChild className="mt-6">
          <Link to="/app">Masuk ke aplikasi</Link>
        </Button>
      </section>
    </main>
  );
}
