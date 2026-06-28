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
import type { ComponentType, CSSProperties } from 'react';
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
import {
  FinancialHealthEmptyState,
  FinancialHealthErrorState,
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

export function DashboardPage() {
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
                    {financialHealthQuery.data.status}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 break-words text-4xl font-semibold tracking-normal drop-shadow-sm sm:text-5xl">
                {moneyFormatter.format(summary?.totalWalletBalance ?? 0)}
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <QuickActionButton icon={ArrowDownCircle} label="Uang Masuk" to="/app/transactions/new?type=income" tone="income" />
          <QuickActionButton icon={ArrowUpCircle} label="Uang Keluar" to="/app/transactions/new?type=expense" tone="expense" />
          <QuickActionButton icon={ArrowRightLeft} label="Pindah Saldo" to="/app/transactions/new?type=transfer" />
        </div>

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

        {dashboardQuery.isLoading ? <DashboardSkeleton /> : null}

        {dashboardQuery.isError ? (
          <DashboardErrorState
            message={dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void dashboardQuery.refetch()}
          />
        ) : null}

        {summary ? (
          <>
            {isEmpty ? <DashboardEmptyState /> : null}

            <section>
              <SectionHeader title="Bulan Ini" />
              <div className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm">
                <div className="grid grid-cols-3 gap-3">
                  <MonthMiniStat label="Masuk" tone="positive" value={moneyFormatter.format(summary.monthlyIncome)} />
                  <MonthMiniStat label="Keluar" tone="negative" value={moneyFormatter.format(summary.monthlyExpense)} />
                  <MonthMiniStat
                    label="Sisa"
                    tone={summary.monthlyCashflow >= 0 ? 'positive' : 'negative'}
                    value={moneyFormatter.format(summary.monthlyCashflow)}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm">
              <SectionHeader title="Kondisi Keuangan" />
              {financialHealthQuery.isLoading ? <FinancialHealthSkeleton /> : null}
              {financialHealthQuery.isError ? (
                <FinancialHealthErrorState
                  message={
                    financialHealthQuery.error instanceof Error
                      ? financialHealthQuery.error.message
                      : 'Kondisi keuangan gagal dimuat.'
                  }
                  onRetry={() => void financialHealthQuery.refetch()}
                />
              ) : null}
              {financialHealthQuery.data && !isFinancialHealthDataEmpty(financialHealthQuery.data) ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-4xl font-semibold tracking-normal">{financialHealthQuery.data.score}</p>
                      <StatusBadge
                        tone={
                          financialHealthQuery.data.score >= 80
                            ? 'good'
                            : financialHealthQuery.data.score >= 60
                              ? 'default'
                              : financialHealthQuery.data.score >= 40
                                ? 'warn'
                                : 'bad'
                        }
                      >
                        {financialHealthQuery.data.status}
                      </StatusBadge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {financialHealthQuery.data.primaryRecommendation}
                    </p>
                  </div>
                  <Button asChild className="w-full rounded-xl sm:w-auto" variant="outline">
                    <Link to="/app/reports">Lihat Ringkasan</Link>
                  </Button>
                </div>
              ) : !financialHealthQuery.isLoading && !financialHealthQuery.isError ? (
                <FinancialHealthEmptyState />
              ) : null}
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

            <section>
              <SectionHeader
                action={
                  <Button asChild size="sm" variant="ghost">
                    <Link to="/app/transactions">Lihat semua</Link>
                  </Button>
                }
                title="Catatan Terakhir"
              />
              <RecentTransactions transactions={summary.recentTransactions} />
            </section>
          </>
        ) : null}
      </div>
    </AppPage>
  );
}

function MonthMiniStat({
  label,
  tone,
  value
}: {
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
