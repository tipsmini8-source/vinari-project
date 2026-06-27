import {
  BarChart3,
  Bell,
  CircleDollarSign,
  Home,
  Landmark,
  Settings,
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
    label: 'Home',
    href: '/app',
    icon: Home
  },
  {
    label: 'Wallet',
    href: '/app/wallets',
    icon: WalletCards
  },
  {
    label: 'Budget',
    href: '/app/budgets',
    icon: BarChart3
  },
  {
    label: 'Goal',
    href: '/app/goals',
    icon: Target
  }
];

export const secondaryNavigation: NavigationItem[] = [
  {
    label: 'Debt',
    href: '/app/debts',
    icon: Landmark
  },
  {
    label: 'Insight',
    href: '/app/insights',
    icon: CircleDollarSign
  },
  {
    label: 'Notification',
    href: '/app/notifications',
    icon: Bell
  },
  {
    label: 'Settings',
    href: '/app/settings',
    icon: Settings
  }
];
