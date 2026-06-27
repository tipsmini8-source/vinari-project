import type { ReactNode } from 'react';

type PagePlaceholderProps = {
  title: string;
  description: string;
  meta?: ReactNode;
};

export function PagePlaceholder({ description, meta, title }: PagePlaceholderProps) {
  return (
    <section className="mx-auto flex min-h-[calc(100svh-9rem)] w-full max-w-5xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        {meta ? <div className="mb-4 text-sm font-medium text-primary">{meta}</div> : null}
        <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}
