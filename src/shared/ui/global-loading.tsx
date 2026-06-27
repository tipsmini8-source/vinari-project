export function GlobalLoading() {
  return (
    <div className="grid min-h-svh place-items-center bg-background px-6 text-foreground">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>Memuat Vinari</span>
      </div>
    </div>
  );
}
