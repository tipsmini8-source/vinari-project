import {
  BarChart3,
  CreditCard,
  Crown,
  FileText,
  Home,
  Landmark,
  Repeat,
  ReceiptText,
  Tags,
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
    label: 'Categories',
    href: '/app/categories',
    icon: Tags
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
  },
  {
    label: 'Recurring',
    href: '/app/recurring',
    icon: Repeat
  },
  {
    label: 'Subscriptions',
    href: '/app/subscriptions',
    icon: CreditCard
  },
  {
    label: 'Upgrade',
    href: '/app/upgrade',
    icon: Crown
  },
  {
    label: 'Billing',
    href: '/app/billing',
    icon: CreditCard
  }
];

export const appNavigation = [...primaryNavigation, ...secondaryNavigation];
