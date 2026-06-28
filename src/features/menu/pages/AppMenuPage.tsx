import {
  BarChart3,
  Calculator,
  CreditCard,
  Crown,
  FileText,
  Landmark,
  Lightbulb,
  ReceiptText,
  Settings,
  Tags,
  Target,
  UserCircle,
  Users,
  WalletCards,
  Repeat
} from 'lucide-react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { AppPage, PageHeader } from '@shared/components/mobile-ui';
import { GlobalLoading } from '@shared/ui/global-loading';

const groups = [
  {
    title: 'Keuangan Harian',
    items: [
      { href: '/app/transactions', icon: ReceiptText, label: 'Catatan Uang' },
      { href: '/app/wallets', icon: WalletCards, label: 'Dompet' },
      { href: '/app/categories', icon: Tags, label: 'Kategori' }
    ]
  },
  {
    title: 'Rencana',
    items: [
      { href: '/app/budgets', icon: BarChart3, label: 'Batas Pengeluaran' },
      { href: '/app/goals', icon: Target, label: 'Target Tabungan' },
      { href: '/app/debts', icon: Landmark, label: 'Hutang/Cicilan' },
      { href: '/app/recurring', icon: Repeat, label: 'Transaksi Rutin' },
      { href: '/app/subscriptions', icon: CreditCard, label: 'Langganan' }
    ]
  },
  {
    title: 'Ringkasan',
    items: [
      { href: '/app/reports', icon: FileText, label: 'Ringkasan' },
      { href: '/app/insights', icon: Lightbulb, label: 'Insight' },
      { href: '/app/simulator', icon: Calculator, label: 'Simulator' }
    ]
  },
  {
    title: 'Premium',
    items: [
      { href: '/app/upgrade', icon: Crown, label: 'Upgrade Premium' },
      { href: '/app/billing', icon: CreditCard, label: 'Pembayaran' }
    ]
  },
  {
    title: 'Akun',
    items: [
      { href: '/app/settings/profile', icon: UserCircle, label: 'Profil' },
      { href: '/app/settings/preferences', icon: Settings, label: 'Preferensi' },
      { href: '/app/settings/workspace', icon: WalletCards, label: 'Workspace' },
      { href: '/app/settings/members', icon: Users, label: 'Anggota' }
    ]
  }
];

export function AppMenuPage() {
  const { loading, workspace } = useWorkspace();

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  return (
    <AppPage>
      <PageHeader
        description="Semua fitur Vinari dalam satu tempat, tanpa membuat navigasi utama terlalu penuh."
        eyebrow={workspace.name}
        title="Semua Fitur"
      />

      <div className="space-y-5">
        {groups.map((group) => (
          <section className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm" key={group.title}>
            <h2 className="font-semibold">{group.title}</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {group.items.map(({ href, icon: Icon, label }) => (
                <Link
                  className="flex min-h-20 items-center gap-3 rounded-2xl bg-muted/60 p-3 transition-colors hover:bg-accent"
                  key={href}
                  to={href}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-sm font-semibold leading-5">{label}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppPage>
  );
}
