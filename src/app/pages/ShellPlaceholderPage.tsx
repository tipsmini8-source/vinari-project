import { useLocation } from 'react-router';

import { PagePlaceholder } from '@shared/ui/page-placeholder';

const titles: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/wallets': 'Wallet',
  '/app/transactions': 'Transactions',
  '/app/budgets': 'Budget',
  '/app/goals': 'Goal',
  '/app/debts': 'Debt',
  '/app/reports': 'Reports'
};

export function ShellPlaceholderPage() {
  const location = useLocation();
  const title = titles[location.pathname] ?? 'Workspace';

  return (
    <PagePlaceholder
      description="Navigasi dan layout sudah tersedia. Konten domain akan dibuat pada fase fitur berikutnya."
      meta="Placeholder"
      title={title}
    />
  );
}
