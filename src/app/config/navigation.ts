import {
  BarChart3,
  Bell,
  Calculator,
  CreditCard,
  Crown,
  FileText,
  Home,
  Landmark,
  Lightbulb,
  ListTodo,
  ReceiptText,
  Repeat,
  Settings,
  Tags,
  Target,
  UserCircle,
  WalletCards
} from 'lucide-react';

export type NavigationItem = {
  label: string;
  href: string;
  icon: typeof Home;
  matches?: string[];
};

export type NavigationGroup = NavigationItem & {
  description: string;
  children?: NavigationItem[];
};

export function isNavigationActive(pathname: string, item: Pick<NavigationItem, 'href' | 'matches'>) {
  const matches = item.matches ?? [item.href];
  return matches.some((match) => (match === '/app' ? pathname === '/app' : pathname.startsWith(match)));
}

export const mainNavigation: NavigationGroup[] = [
  {
    label: 'Beranda',
    href: '/app',
    icon: Home,
    description: 'Saldo, aksi cepat, dan kondisi uang.',
    matches: ['/app']
  },
  {
    label: 'Catatan',
    href: '/app/transactions',
    icon: ReceiptText,
    description: 'Catat uang masuk, uang keluar, dan pindah saldo.',
    matches: ['/app/transactions'],
    children: [
      { label: 'Catatan Uang', href: '/app/transactions', icon: ReceiptText },
      { label: 'Kategori', href: '/app/categories', icon: Tags, matches: ['/app/categories'] }
    ]
  },
  {
    label: 'Dompet',
    href: '/app/wallets',
    icon: WalletCards,
    description: 'Semua dompet dan saldo aktif.',
    matches: ['/app/wallets']
  },
  {
    label: 'Rencana',
    href: '/app/budgets',
    icon: ListTodo,
    description: 'Batas pengeluaran, target tabungan, dan hutang.',
    matches: ['/app/budgets', '/app/goals', '/app/debts', '/app/recurring', '/app/subscriptions'],
    children: [
      { label: 'Batas Pengeluaran', href: '/app/budgets', icon: BarChart3 },
      { label: 'Target Tabungan', href: '/app/goals', icon: Target },
      { label: 'Hutang/Cicilan', href: '/app/debts', icon: Landmark },
      { label: 'Transaksi Rutin', href: '/app/recurring', icon: Repeat },
      { label: 'Langganan', href: '/app/subscriptions', icon: CreditCard }
    ]
  },
  {
    label: 'Ringkasan',
    href: '/app/reports',
    icon: FileText,
    description: 'Laporan, insight, simulator, dan notifikasi.',
    matches: ['/app/reports', '/app/insights', '/app/simulator', '/app/notifications'],
    children: [
      { label: 'Ringkasan', href: '/app/reports', icon: FileText },
      { label: 'Insight', href: '/app/insights', icon: Lightbulb },
      { label: 'Simulator', href: '/app/simulator', icon: Calculator },
      { label: 'Notifikasi', href: '/app/notifications', icon: Bell }
    ]
  },
  {
    label: 'Akun',
    href: '/app/settings',
    icon: UserCircle,
    description: 'Profil, ruang keuangan, anggota, dan pembayaran.',
    matches: ['/app/settings', '/app/billing', '/app/upgrade'],
    children: [
      { label: 'Pengaturan', href: '/app/settings', icon: Settings },
      { label: 'Pembayaran', href: '/app/billing', icon: CreditCard },
      { label: 'Upgrade Premium', href: '/app/upgrade', icon: Crown }
    ]
  }
];

export const appNavigation = mainNavigation.filter((item) =>
  ['Beranda', 'Catatan', 'Dompet', 'Rencana', 'Akun'].includes(item.label)
);

export const primaryNavigation = mainNavigation.slice(0, 3);
export const secondaryNavigation = mainNavigation.slice(3);
