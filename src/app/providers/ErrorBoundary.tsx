import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';

import { Button } from '@shared/ui/button';

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {
      hasError: true
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Vinari Error Boundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-svh place-items-center bg-background px-6 text-foreground">
          <div className="max-w-md text-center">
            <p className="text-sm font-medium text-primary">Vinari</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal">
              Aplikasi perlu dimuat ulang
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Terjadi masalah pada shell aplikasi. Muat ulang halaman untuk memulai kembali.
            </p>
            <Button
              className="mt-8"
              type="button"
              onClick={() => {
                window.location.reload();
              }}
            >
              Muat ulang
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
