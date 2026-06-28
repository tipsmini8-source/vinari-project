import {
  ArrowDownCircle,
  ArrowRightLeft,
  ArrowUpCircle,
  BarChart3,
  Bell,
  Calculator,
  Crown,
  CreditCard,
  Landmark,
  Lightbulb,
  MoreHorizontal,
  Repeat,
  Settings,
  Target,
  WalletCards
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { useState, type ComponentType, type CSSProperties } from 'react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { useAuth } from '@features/auth';
import {
  DashboardEmptyState,
  DashboardErrorState,
  DashboardSkeleton
} from '@features/dashboard/components/DashboardStates';
import { RecentTransactions } from '@features/dashboard/components/RecentTransactions';
import { useDashboardSummary } from '@features/dashboard/hooks/useDashboard';
import type { DashboardSummary } from '@features/dashboard/types/dashboard.types';
import {
  FinancialHealthEmptyState,
  FinancialHealthErrorState,
  type FinancialHealthScore,
  FinancialHealthSkeleton,
  isFinancialHealthDataEmpty,
  useFinancialHealthScore
} from '@features/financial-health';
import { InsightErrorState, InsightSkeleton, useInsights } from '@features/insight';
import { AppPage, QuickActionButton, SectionHeader, StatusBadge } from '@shared/components/mobile-ui';
import { getFeatureAccent, getFeatureAccentKey } from '@shared/theme/feature-accents';
import { useAppTemplate } from '@shared/theme/use-app-template';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  style: 'currency',
  maximumFractionDigits: 0
});

function getFirstName(name: string | null | undefined, email: string | undefined) {
  const fallback = email?.split('@')[0] ?? 'teman';
  return (name || fallback).trim().split(/\s+/)[0] ?? fallback;
}

const featureMenu = [
  { href: '/app/wallets', icon: WalletCards, label: 'Dompet' },
  { href: '/app/budgets', icon: BarChart3, label: 'Batas' },
  { href: '/app/goals', icon: Target, label: 'Target' },
  { href: '/app/debts', icon: Landmark, label: 'Hutang' },
  { href: '/app/recurring', icon: Repeat, label: 'Rutin' },
  { href: '/app/subscriptions', icon: CreditCard, label: 'Langganan' },
  { href: '/app/insights', icon: Lightbulb, label: 'Insight' },
  { href: '/app/simulator', icon: Calculator, label: 'Simulator' },
  { href: '/app/upgrade', icon: Crown, label: 'Premium' },
  { href: '/app/menu', icon: MoreHorizontal, label: 'Lihat Semua' }
];

type RecapPeriod = 'today' | 'week' | 'month';

const recapPeriods: Array<{ label: string; value: RecapPeriod }> = [
  { label: 'Hari Ini', value: 'today' },
  { label: 'Minggu Ini', value: 'week' },
  { label: 'Bulan Ini', value: 'month' }
];

export function DashboardPage() {
  const [recapPeriod, setRecapPeriod] = useState<RecapPeriod>('month');
  const { user } = useAuth();
  const { loading, workspace } = useWorkspace();
  const dashboardQuery = useDashboardSummary(workspace?.id);
  const financialHealthQuery = useFinancialHealthScore(workspace?.id);
  const insightsQuery = useInsights(workspace?.id);
  const { activeColors } = useAppTemplate();
  const summary = dashboardQuery.data;
  const displayName = getFirstName(user?.user_metadata?.full_name as string | undefined, user?.email);
  const isEmpty = summary
    ? summary.activeWalletCount === 0 &&
      summary.recentTransactions.length === 0 &&
      summary.activeBudgetCount === 0 &&
      summary.activeGoalCount === 0 &&
      summary.achievedGoalCount === 0 &&
      summary.activeDebtCount === 0
    : false;

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  return (
    <AppPage className="[&>section]:max-w-5xl">
      <div className="space-y-5">
        <section
          className="relative overflow-hidden rounded-[2rem] p-5 text-white shadow-[0_24px_60px_rgba(15,23,42,0.28)] sm:p-6"
          style={{ background: activeColors.heroGradient }}
        >
          <div className="pointer-events-none absolute -right-14 -top-16 size-44 rounded-full bg-white/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-8 size-52 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.22)_0,rgba(255,255,255,0)_18%),linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_48%)]" />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm opacity-90">Halo, {displayName}</p>
                <h1 className="mt-1 truncate text-xl font-semibold tracking-normal">{workspace.name}</h1>
              </div>
              <div className="flex gap-1">
                <Button asChild className="rounded-full bg-white/15 text-white hover:bg-white/25" size="icon" variant="ghost">
                  <Link aria-label="Buka notifikasi" to="/app/notifications">
                    <Bell className="size-5" />
                  </Link>
                </Button>
                <Button asChild className="rounded-full bg-white/15 text-white hover:bg-white/25" size="icon" variant="ghost">
                  <Link aria-label="Buka pengaturan" to="/app/settings">
                    <Settings className="size-5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm opacity-90">Total Saldo</p>
                {financialHealthQuery.data && !isFinancialHealthDataEmpty(financialHealthQuery.data) ? (
                  <span className="rounded-full border border-white/15 bg-white/15 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur">
                    {getMoneyCondition(financialHealthQuery.data).label}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 break-words text-4xl font-semibold tracking-normal drop-shadow-sm sm:text-5xl">
                {moneyFormatter.format(summary?.totalWalletBalance ?? 0)}
              </p>
              <WalletBalanceChips wallets={summary?.walletBalances ?? []} />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <QuickActionButton icon={ArrowDownCircle} label="Uang Masuk" to="/app/transactions/new?type=income" tone="income" />
          <QuickActionButton icon={ArrowUpCircle} label="Uang Keluar" to="/app/transactions/new?type=expense" tone="expense" />
          <QuickActionButton icon={ArrowRightLeft} label="Pindah Saldo" to="/app/transactions/new?type=transfer" />
        </div>

        {dashboardQuery.isLoading ? <DashboardSkeleton /> : null}

        {dashboardQuery.isError ? (
          <DashboardErrorState
            message={dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void dashboardQuery.refetch()}
          />
        ) : null}

        {summary ? (
          <>
            <section className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SectionHeader title="Rekap Keuangan" />
                <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted/70 p-1 text-xs font-semibold">
                  {recapPeriods.map((period) => (
                    <button
                      className={
                        recapPeriod === period.value
                          ? 'rounded-lg bg-card px-2.5 py-2 text-foreground shadow-sm'
                          : 'rounded-lg px-2.5 py-2 text-muted-foreground transition-colors hover:text-foreground'
                      }
                      key={period.value}
                      onClick={() => setRecapPeriod(period.value)}
                      type="button"
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>
              <FinancialRecap summary={summary} period={recapPeriod} />
            </section>

            {isEmpty ? <DashboardEmptyState /> : null}

            <section className="rounded-[1.75rem] border border-border/80 bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FBFF_100%)] p-4 text-card-foreground shadow-[0_18px_45px_rgba(15,23,42,0.08)] dark:bg-[linear-gradient(180deg,#0F172A_0%,#111827_100%)] sm:p-5">
              <SectionHeader title="Fitur Keuangan" />
              <div className="mx-auto grid max-w-3xl grid-cols-3 gap-x-2 gap-y-4 min-[380px]:grid-cols-4 sm:grid-cols-5 sm:gap-4">
                {featureMenu.map(({ href, icon: Icon, label }) => {
                  const accent = getFeatureAccent(getFeatureAccentKey(href));

                  return (
                    <Link
                      className="group flex min-w-0 flex-col items-center gap-2 rounded-2xl p-2 text-center transition-all hover:-translate-y-0.5 hover:bg-white/70 hover:shadow-sm dark:hover:bg-white/5"
                      key={href}
                      to={href}
                    >
                      <span
                        className="flex size-14 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-105 sm:size-16 [background-color:var(--feature-bg)] [color:var(--feature-icon)] dark:[background-color:var(--feature-bg-dark)] dark:[color:var(--feature-icon-dark)]"
                        style={
                          {
                            '--feature-bg': accent.bg,
                            '--feature-bg-dark': accent.darkBg,
                            '--feature-icon': accent.icon,
                            '--feature-icon-dark': accent.darkIcon
                          } as CSSProperties
                        }
                      >
                        <Icon className="size-7 sm:size-8" />
                      </span>
                      <span className="min-h-8 max-w-full text-[11px] font-semibold leading-4 text-foreground sm:text-xs">
                        {label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm">
              <SectionHeader title="Kondisi Uang Saat Ini" />
              {financialHealthQuery.isLoading ? <FinancialHealthSkeleton /> : null}
              {financialHealthQuery.isError ? (
                <FinancialHealthErrorState
                  message={
                    financialHealthQuery.error instanceof Error
                      ? financialHealthQuery.error.message
                      : 'Kondisi uang gagal dimuat.'
                  }
                  onRetry={() => void financialHealthQuery.refetch()}
                />
              ) : null}
              {financialHealthQuery.data && !isFinancialHealthDataEmpty(financialHealthQuery.data) ? (
                <MoneyConditionCard score={financialHealthQuery.data} />
              ) : !financialHealthQuery.isLoading && !financialHealthQuery.isError ? (
                <FinancialHealthEmptyState />
              ) : null}
            </section>

            <section>
              <RecentTransactions transactions={summary.recentTransactions} />
            </section>

            <section>
              <SectionHeader title="Rencana" />
              <div className="grid gap-3 sm:grid-cols-3">
                <PlanShortcut
                  activeColors={activeColors}
                  href="/app/budgets"
                  icon={BarChart3}
                  label="Batas Pengeluaran"
                  meta={`${summary.activeBudgetCount} aktif`}
                  text="Atur batas uang keluar agar tidak kebablasan."
                />
                <PlanShortcut
                  activeColors={activeColors}
                  href="/app/goals"
                  icon={Target}
                  label="Target Tabungan"
                  meta={`${summary.activeGoalCount} aktif`}
                  text="Pantau progres tabungan untuk tujuan tertentu."
                />
                <PlanShortcut
                  activeColors={activeColors}
                  href="/app/debts"
                  icon={Landmark}
                  label="Hutang/Cicilan"
                  meta={moneyFormatter.format(summary.debtRemainingTotal)}
                  text="Lihat sisa hutang dan cicilan yang perlu dibayar."
                />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm">
              <SectionHeader
                action={
                  <Button asChild size="sm" variant="ghost">
                    <Link to="/app/insights">Lihat semua</Link>
                  </Button>
                }
                title="Saran untuk Kamu"
              />
              {insightsQuery.isLoading ? <InsightSkeleton count={2} /> : null}
              {insightsQuery.isError ? (
                <InsightErrorState
                  message={insightsQuery.error instanceof Error ? insightsQuery.error.message : 'Insight gagal dimuat.'}
                  onRetry={() => void insightsQuery.refetch()}
                />
              ) : null}
              {!insightsQuery.isLoading && !insightsQuery.isError ? (
                <div className="grid gap-3">
                  {(insightsQuery.data ?? []).slice(0, 2).map((insight) => (
                    <Link
                      className="rounded-xl bg-muted/60 p-3 transition-colors hover:bg-accent"
                      key={insight.id}
                      to={insight.action_url ?? '/app/insights'}
                    >
                      <div className="flex items-start gap-3">
                        <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <p className="font-medium">{insight.title}</p>
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{insight.message}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {(insightsQuery.data ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum ada insight. Tambahkan catatan uang dulu.</p>
                  ) : null}
                </div>
              ) : null}
            </section>

          </>
        ) : null}
      </div>
    </AppPage>
  );
}

function WalletBalanceChips({
  wallets
}: {
  wallets: Array<{
    id: string;
    name: string;
    current_balance: number;
  }>;
}) {
  if (wallets.length === 0) {
    return null;
  }

  const visibleWallets = wallets.slice(0, 3);
  const remainingWalletCount = Math.max(wallets.length - visibleWallets.length, 0);

  return (
    <div className="mt-4">
      <p className="text-xs font-medium uppercase tracking-wide text-white/70">Saldo Dompet</p>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {visibleWallets.map((wallet) => (
          <Link
            className="shrink-0 rounded-2xl border border-white/15 bg-white/15 px-3 py-2 text-left shadow-sm backdrop-blur transition-colors hover:bg-white/25"
            key={wallet.id}
            to="/app/wallets"
          >
            <span className="block max-w-28 truncate text-xs font-medium text-white/80">{wallet.name}</span>
            <span className="mt-0.5 block text-sm font-semibold text-white">
              {moneyFormatter.format(wallet.current_balance)}
            </span>
          </Link>
        ))}
        {remainingWalletCount > 0 ? (
          <Link
            className="flex shrink-0 items-center rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white/25"
            to="/app/wallets"
          >
            +{remainingWalletCount} dompet lainnya
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function getRecap(summary: DashboardSummary, period: RecapPeriod) {
  if (period === 'today') {
    return {
      cashflow: summary.dailyCashflow,
      expense: summary.dailyExpense,
      income: summary.dailyIncome
    };
  }

  if (period === 'week') {
    return {
      cashflow: summary.weeklyCashflow,
      expense: summary.weeklyExpense,
      income: summary.weeklyIncome
    };
  }

  return {
    cashflow: summary.monthlyCashflow,
    expense: summary.monthlyExpense,
    income: summary.monthlyIncome
  };
}

function FinancialRecap({ period, summary }: { period: RecapPeriod; summary: DashboardSummary }) {
  const recap = getRecap(summary, period);
  const isPositiveDifference = recap.cashflow >= 0;
  const differenceValue = isPositiveDifference
    ? moneyFormatter.format(recap.cashflow)
    : `Kurang ${moneyFormatter.format(Math.abs(recap.cashflow))}`;

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        <MonthMiniStat label="Masuk" tone="positive" value={moneyFormatter.format(recap.income)} />
        <MonthMiniStat label="Keluar" tone="negative" value={moneyFormatter.format(recap.expense)} />
        <MonthMiniStat
          helper={isPositiveDifference ? 'Masih lebih' : undefined}
          label="Selisih"
          tone={isPositiveDifference ? 'positive' : 'negative'}
          value={differenceValue}
        />
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        Selisih dihitung dari uang masuk dikurangi uang keluar pada periode ini.
      </p>
    </div>
  );
}

function getMoneyCondition(score: FinancialHealthScore) {
  const { metrics } = score;

  if (score.status === 'Berisiko') {
    return {
      badgeClass: 'bg-destructive/10 text-destructive',
      description:
        metrics.monthlyExpense > metrics.monthlyIncome
          ? 'Uang keluar kamu sedang lebih besar daripada uang masuk.'
          : 'Ada beberapa bagian keuangan yang perlu segera dirapikan.',
      label: 'Berisiko',
      suggestion: 'Mulai dari mengurangi pengeluaran yang tidak penting dan cek cicilan yang paling mendesak.'
    };
  }

  if (score.status === 'Perlu Perhatian') {
    return {
      badgeClass: 'bg-warning/15 text-warning',
      description:
        metrics.budgetOverCount > 0
          ? 'Ada batas pengeluaran yang sudah terlewati.'
          : 'Keuangan kamu masih berjalan, tapi ada tanda yang perlu diperhatikan.',
      label: 'Perlu Diperhatikan',
      suggestion: 'Coba cek pengeluaran minggu ini dan tahan belanja yang belum penting.'
    };
  }

  if (score.status === 'Cukup Sehat') {
    return {
      badgeClass: 'bg-primary-soft text-primary',
      description: 'Keuangan kamu cukup terkendali, tetapi masih ada ruang untuk dibuat lebih kuat.',
      label: 'Cukup Aman',
      suggestion: 'Lanjutkan mencatat uang dan tambah dana cadangan sedikit demi sedikit.'
    };
  }

  return {
    badgeClass: 'bg-success/10 text-success',
    description: 'Uang masuk, uang keluar, dan rencana keuangan kamu terlihat cukup seimbang.',
    label: 'Aman',
    suggestion: 'Pertahankan kebiasaan ini dan cek ringkasan secara berkala.'
  };
}

function MoneyConditionCard({ score }: { score: FinancialHealthScore }) {
  const condition = getMoneyCondition(score);

  return (
    <div className="space-y-3">
      <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${condition.badgeClass}`}>
        {condition.label}
      </span>
      <div>
        <p className="text-sm leading-6 text-foreground">{condition.description}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{condition.suggestion}</p>
      </div>
      <Button asChild className="w-full rounded-xl sm:w-auto" variant="outline">
        <Link to="/app/reports">Lihat Ringkasan</Link>
      </Button>
    </div>
  );
}

function MonthMiniStat({
  helper,
  label,
  tone,
  value
}: {
  helper?: string;
  label: string;
  tone: 'positive' | 'negative';
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 truncate text-sm font-semibold sm:text-base ${tone === 'positive' ? 'text-success' : 'text-destructive'}`}>
        {value}
      </p>
      {helper ? <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{helper}</p> : null}
    </div>
  );
}

function PlanShortcut({
  activeColors,
  href,
  icon: Icon,
  label,
  meta,
  text
}: {
  activeColors: ReturnType<typeof useAppTemplate>['activeColors'];
  href: string;
  icon: ComponentType<LucideProps>;
  label: string;
  meta: string;
  text: string;
}) {
  return (
    <Link className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-accent" to={href}>
      <div className="flex items-start justify-between gap-3">
        <span
          className="flex size-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: activeColors.iconSoftBackground, color: activeColors.primaryColor }}
        >
          <Icon className="size-5" />
        </span>
        <StatusBadge>{meta}</StatusBadge>
      </div>
      <h3 className="mt-4 font-semibold">{label}</h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
    </Link>
  );
}
