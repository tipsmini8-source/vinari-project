import { Navigate, createBrowserRouter } from 'react-router';

import { AuthLayout } from '@app/layouts/AuthLayout';
import { DashboardLayout } from '@app/layouts/DashboardLayout';
import { RootLayout } from '@app/layouts/RootLayout';
import { NotFoundPage } from '@app/pages/NotFoundPage';
import { ProtectedRoute } from '@app/routes/ProtectedRoute';
import { PublicRoute } from '@app/routes/PublicRoute';
import { RouteErrorBoundary } from '@app/routes/RouteErrorBoundary';
import { AdminDashboardPage, AdminGuard, AdminPaymentsPage } from '@features/admin';
import {
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
  VerifyEmailPage
} from '@features/auth/pages';
import { BudgetFormPage, BudgetListPage } from '@features/budget';
import { CategoryFormPage, CategoryListPage } from '@features/category';
import { DashboardPage } from '@features/dashboard';
import { DebtDetailPage, DebtFormPage, DebtListPage } from '@features/debt';
import { GoalDetailPage, GoalFormPage, GoalListPage } from '@features/goal';
import { OnboardingPage } from '@features/onboarding';
import { BillingPage, UpgradePage } from '@features/premium';
import {
  RecurringFormPage,
  RecurringListPage,
  SubscriptionFormPage,
  SubscriptionListPage
} from '@features/recurring';
import { ReportPage } from '@features/report';
import {
  PreferencesSettingsPage,
  ProfileSettingsPage,
  SecuritySettingsPage,
  SettingsHomePage,
  WorkspaceSettingsPage
} from '@features/settings';
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
            element: <DashboardLayout />,
            children: [
              {
                index: true,
                element: <DashboardPage />
              },
              {
                path: 'wallets',
                element: <WalletPage />
              },
              {
                path: 'transactions',
                element: <TransactionListPage />
              },
              {
                path: 'transactions/new',
                element: <TransactionFormPage />
              },
              {
                path: 'transactions/:id',
                element: <TransactionDetailPage />
              },
              {
                path: 'transactions/:id/edit',
                element: <TransactionFormPage />
              },
              {
                path: 'budgets',
                element: <BudgetListPage />
              },
              {
                path: 'budgets/new',
                element: <BudgetFormPage />
              },
              {
                path: 'budgets/:id/edit',
                element: <BudgetFormPage />
              },
              {
                path: 'categories',
                element: <CategoryListPage />
              },
              {
                path: 'categories/new',
                element: <CategoryFormPage />
              },
              {
                path: 'categories/:id/edit',
                element: <CategoryFormPage />
              },
              {
                path: 'goals',
                element: <GoalListPage />
              },
              {
                path: 'goals/new',
                element: <GoalFormPage />
              },
              {
                path: 'goals/:id',
                element: <GoalDetailPage />
              },
              {
                path: 'goals/:id/edit',
                element: <GoalFormPage />
              },
              {
                path: 'debts',
                element: <DebtListPage />
              },
              {
                path: 'debts/new',
                element: <DebtFormPage />
              },
              {
                path: 'debts/:id',
                element: <DebtDetailPage />
              },
              {
                path: 'debts/:id/edit',
                element: <DebtFormPage />
              },
              {
                path: 'reports',
                element: <ReportPage />
              },
              {
                path: 'upgrade',
                element: <UpgradePage />
              },
              {
                path: 'billing',
                element: <BillingPage />
              },
              {
                path: 'settings',
                element: <SettingsHomePage />
              },
              {
                path: 'settings/profile',
                element: <ProfileSettingsPage />
              },
              {
                path: 'settings/preferences',
                element: <PreferencesSettingsPage />
              },
              {
                path: 'settings/workspace',
                element: <WorkspaceSettingsPage />
              },
              {
                path: 'settings/security',
                element: <SecuritySettingsPage />
              },
              {
                path: 'recurring',
                element: <RecurringListPage />
              },
              {
                path: 'recurring/new',
                element: <RecurringFormPage />
              },
              {
                path: 'recurring/:id/edit',
                element: <RecurringFormPage />
              },
              {
                path: 'subscriptions',
                element: <SubscriptionListPage />
              },
              {
                path: 'subscriptions/new',
                element: <SubscriptionFormPage />
              },
              {
                path: 'subscriptions/:id/edit',
                element: <SubscriptionFormPage />
              }
            ]
          }
        ]
      },
      {
        path: 'admin',
        element: <AdminGuard />,
        children: [
          {
            index: true,
            element: <AdminDashboardPage />
          },
          {
            path: 'payments',
            element: <AdminPaymentsPage />
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
