import type { PropsWithChildren } from 'react';

type OnboardingShellProps = PropsWithChildren<{
  currentStep: number;
  totalSteps: number;
  title: string;
  description: string;
}>;

export function OnboardingShell({
  children,
  currentStep,
  description,
  title,
  totalSteps
}: OnboardingShellProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <main className="min-h-svh bg-background px-4 py-8 text-foreground">
      <section className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-2xl flex-col justify-center">
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>Vinari</span>
            <span>
              Langkah {currentStep} dari {totalSteps}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-6 text-card-foreground shadow-sm">
          <div className="mb-6 space-y-2">
            <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
