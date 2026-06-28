import type { PropsWithChildren } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';

import { ErrorBoundary } from '@app/providers/ErrorBoundary';
import { ThemeProvider } from '@app/providers/ThemeProvider';
import { WorkspaceProvider } from '@/core/workspace';
import { AuthProvider } from '@features/auth';
import { queryClient } from '@shared/api/query-client';
import { AppTemplateProvider } from '@shared/theme/use-app-template';
import { ToastProvider } from '@shared/ui/toast';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <AppTemplateProvider>
                <WorkspaceProvider>{children}</WorkspaceProvider>
              </AppTemplateProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
