import { Button } from '@shared/ui/button';

export function AuthPlaceholderPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <p className="text-sm font-medium text-primary">Authentication Layout</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal">Masuk ke Vinari</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Form autentikasi belum dibuat. Layout ini disiapkan sebagai fondasi alur publik.
        </p>
      </div>
      <Button className="w-full" disabled>
        Supabase Auth akan dihubungkan nanti
      </Button>
    </div>
  );
}
