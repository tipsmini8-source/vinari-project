import {
  BarChart3,
  FileText,
  Home,
  Landmark,
  ReceiptText,
  Target,
  WalletCards
} from 'lucide-react';

export type NavigationItem = {
  label: string;
  href: string;
  icon: typeof Home;
};

export const primaryNavigation: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/app',
    icon: Home
  },
  {
    label: 'Wallet',
    href: '/app/wallets',
    icon: WalletCards
  },
  {
    label: 'Transactions',
    href: '/app/transactions',
    icon: ReceiptText
  },
  {
    label: 'Budgets',
    href: '/app/budgets',
    icon: BarChart3
  },
  {
    label: 'Goals',
    href: '/app/goals',
    icon: Target
  }
];

export const secondaryNavigation: NavigationItem[] = [
  {
    label: 'Debts',
    href: '/app/debts',
    icon: Landmark
  },
  {
    label: 'Reports',
    href: '/app/reports',
    icon: FileText
  }
];

export const appNavigation = [...primaryNavigation, ...secondaryNavigation];
