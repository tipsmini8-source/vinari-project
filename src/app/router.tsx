import { Navigate, createBrowserRouter } from 'react-router';

import { AuthLayout } from '@app/layouts/AuthLayout';
import { RootLayout } from '@app/layouts/RootLayout';
import { NotFoundPage } from '@app/pages/NotFoundPage';
import { ProtectedRoute } from '@app/routes/ProtectedRoute';
import { PublicRoute } from '@app/routes/PublicRoute';
import { RouteErrorBoundary } from '@app/routes/RouteErrorBoundary';
import {
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
  VerifyEmailPage
} from '@features/auth/pages';
import { DashboardPage } from '@features/dashboard';
import { OnboardingPage } from '@features/onboarding';
import { TransactionDetailPage, TransactionFormPage, TransactionListPage } from '@features/transaction';
import { WalletPage } from '@features/wallet';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate replace to="/app" />
      },
      {
        element: <PublicRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              {
                path: 'login',
                element: <LoginPage />
              },
              {
                path: 'register',
                element: <RegisterPage />
              },
              {
                path: 'forgot-password',
                element: <ForgotPasswordPage />
              },
              {
                path: 'auth',
                children: [
                  {
                    index: true,
                    element: <Navigate replace to="/login" />
                  },
                  {
                    path: 'sign-in',
                    element: <Navigate replace to="/login" />
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        element: <AuthLayout />,
        children: [
          {
            path: 'reset-password',
            element: <ResetPasswordPage />
          },
          {
            path: 'verify-email',
            element: <VerifyEmailPage />
          }
        ]
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'onboarding',
            element: <OnboardingPage />
          }
        ]
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'app',
            element: <DashboardPage />
          },
          {
            path: 'app/wallets',
            element: <WalletPage />
          },
          {
            path: 'app/transactions',
            element: <TransactionListPage />
          },
          {
            path: 'app/transactions/new',
            element: <TransactionFormPage />
          },
          {
            path: 'app/transactions/:id',
            element: <TransactionDetailPage />
          },
          {
            path: 'app/transactions/:id/edit',
            element: <TransactionFormPage />
          }
        ]
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);
