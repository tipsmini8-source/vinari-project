import { useLocation } from 'react-router';

import { PagePlaceholder } from '@shared/ui/page-placeholder';

const titles: Record<string, string> = {
  '/app/wallets': 'Wallet',
  '/app/budgets': 'Budget',
  '/app/goals': 'Goal',
  '/app/debts': 'Debt',
  '/app/insights': 'Insight',
  '/app/notifications': 'Notification',
  '/app/settings': 'Settings'
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
