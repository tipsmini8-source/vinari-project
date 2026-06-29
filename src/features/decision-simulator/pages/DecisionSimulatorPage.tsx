import { ArrowLeft, Calculator, CheckCircle2, CreditCard, PiggyBank, WalletCards } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import {
  DebtSimulationForm,
  ExpenseSimulationForm,
  GoalSavingSimulationForm
} from '@features/decision-simulator/components/SimulatorForms';
import {
  ResultMetric,
  SimulationResultCard
} from '@features/decision-simulator/components/SimulationResultCard';
import {
  SimulatorEmptyState,
  SimulatorErrorState,
  SimulatorSkeleton
} from '@features/decision-simulator/components/SimulatorStates';
import {
  useDecisionSimulatorSnapshot,
  useSimulateDebt,
  useSimulateExpense,
  useSimulateGoalSaving
} from '@features/decision-simulator/hooks/useDecisionSimulator';
import type {
  DebtSimulationInput,
  ExpenseSimulationInput,
  GoalSavingSimulationInput
} from '@features/decision-simulator/types/decision-simulator.types';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';
import { GlobalLoading } from '@shared/ui/global-loading';
import { useToast } from '@shared/ui/use-toast';

type SimulatorTab = 'expense' | 'debt' | 'goal';

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  maximumFractionDigits: 0,
  style: 'currency'
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium'
});

const tabs: Array<{ description: string; icon: typeof WalletCards; label: string; value: SimulatorTab }> = [
  {
    description: 'Simulasi untuk pembelian besar atau pengeluaran sekali bayar.',
    icon: WalletCards,
    label: 'Pengeluaran Besar',
    value: 'expense'
  },
  {
    description: 'Hitung cicilan, bunga, dan perkiraan waktu lunas.',
    icon: CreditCard,
    label: 'Cicilan / Hutang Baru',
    value: 'debt'
  },
  {
    description: 'Simulasi menambah tabungan rutin atau satu kali.',
    icon: PiggyBank,
    label: 'Tambah Tabungan Target',
    value: 'goal'
  }
];

function formatMonths(value: number | null) {
  if (value === null) {
    return 'Belum bisa dihitung';
  }

  if (value === 0) {
    return 'Sudah tercapai';
  }

  return `${value} bulan`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date);
}

function estimateDateFromMonths(months: number | null) {
  if (months === null) {
    return 'Belum bisa dihitung';
  }

  const date = new Date();
  date.setMonth(date.getMonth() + months);

  return formatDate(date.toISOString().slice(0, 10));
}

export function DecisionSimulatorPage() {
  const [activeTab, setActiveTab] = useState<SimulatorTab>('debt');
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const snapshotQuery = useDecisionSimulatorSnapshot(workspace?.id);
  const snapshot = snapshotQuery.data;
  const expenseSimulation = useSimulateExpense(snapshot);
  const debtSimulation = useSimulateDebt(snapshot);
  const goalSimulation = useSimulateGoalSaving(snapshot);
  const hasResult = Boolean(expenseSimulation.data || debtSimulation.data || goalSimulation.data);
  const activeStep = hasResult ? 3 : 2;

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  const handleExpense = async (input: ExpenseSimulationInput) => {
    try {
      await expenseSimulation.mutateAsync(input);
      toast({ title: 'Simulasi pengeluaran selesai' });
    } catch (error) {
      toast({
        title: 'Gagal simulasi pengeluaran',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const handleDebt = async (input: DebtSimulationInput) => {
    try {
      await debtSimulation.mutateAsync(input);
      toast({ title: 'Simulasi cicilan selesai' });
    } catch (error) {
      toast({
        title: 'Gagal simulasi cicilan',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const handleGoal = async (input: GoalSavingSimulationInput) => {
    try {
      await goalSimulation.mutateAsync(input);
      toast({ title: 'Simulasi tabungan selesai' });
    } catch (error) {
      toast({
        title: 'Gagal simulasi tabungan',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const handleTabChange = (tab: SimulatorTab) => {
    setActiveTab(tab);
    expenseSimulation.reset();
    debtSimulation.reset();
    goalSimulation.reset();
  };

  return (
    <main className="min-h-svh bg-background px-4 pb-28 pt-6 text-foreground sm:py-8">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-6">
          <Button asChild className="mb-3" size="sm" variant="ghost">
            <Link to="/app">
              <ArrowLeft className="size-4" />
              Kembali
            </Link>
          </Button>
          <div className="overflow-hidden rounded-[2rem] border border-primary/10 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Calculator className="size-6" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-primary">{workspace.name}</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-normal sm:text-4xl">Simulasi Keputusan</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Lihat dulu dampaknya sebelum ambil keputusan uang.
                </p>
                <p className="mt-3 inline-flex rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border">
                  Simulasi ini hanya perkiraan dan tidak mengubah catatan asli.
                </p>
              </div>
            </div>
          </div>
        </div>

        {snapshotQuery.isLoading ? <SimulatorSkeleton /> : null}

        {snapshotQuery.isError ? (
          <SimulatorErrorState
            message={snapshotQuery.error instanceof Error ? snapshotQuery.error.message : 'Terjadi kesalahan.'}
            onRetry={() => void snapshotQuery.refetch()}
          />
        ) : null}

        {snapshot && snapshot.wallets.length === 0 ? <SimulatorEmptyState /> : null}

        {snapshot && snapshot.wallets.length > 0 ? (
          <div className="space-y-5">
            <StepIndicator activeStep={activeStep} />

            <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Langkah 1</p>
                <h2 className="mt-1 font-semibold">Pilih jenis simulasi</h2>
              </div>
              <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
                {tabs.map((tab) => {
                  const Icon = tab.icon;

                  return (
                    <button
                      className={cn(
                        'relative min-w-[250px] rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md md:min-w-0',
                        activeTab === tab.value
                          ? 'border-primary/30 bg-primary/10 text-foreground'
                          : 'border-border bg-background text-muted-foreground'
                      )}
                      key={tab.value}
                      onClick={() => handleTabChange(tab.value)}
                      type="button"
                    >
                      {activeTab === tab.value ? (
                        <span className="absolute right-3 top-3 rounded-full bg-primary text-primary-foreground">
                          <CheckCircle2 className="size-5" />
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          'flex size-11 items-center justify-center rounded-2xl',
                          activeTab === tab.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        )}
                      >
                        <Icon className="size-5" />
                      </span>
                      <span className="mt-3 block font-semibold text-foreground">{tab.label}</span>
                      <span className="mt-1 block text-sm leading-6">{tab.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {activeTab === 'expense' ? (
              <>
                <ExpenseSimulationForm
                  isSubmitting={expenseSimulation.isPending}
                  onSubmit={handleExpense}
                  snapshot={snapshot}
                />
                {expenseSimulation.data ? (
                  <SimulationResultCard
                    details={expenseSimulation.data.details}
                    recommendation={expenseSimulation.data.recommendation}
                    status={expenseSimulation.data.status}
                    title={expenseSimulation.data.decisionName}
                  >
                    <ResultMetric
                      label="Saldo dompet setelah"
                      value={moneyFormatter.format(expenseSimulation.data.walletBalanceAfter)}
                    />
                    <ResultMetric
                      label="Total saldo setelah"
                      value={moneyFormatter.format(expenseSimulation.data.totalBalanceAfter)}
                    />
                    <ResultMetric
                      label="Uang keluar setelah simulasi"
                      value={moneyFormatter.format(expenseSimulation.data.monthlyExpenseAfter)}
                    />
                    <ResultMetric
                      label="Selisih uang setelah simulasi"
                      value={moneyFormatter.format(expenseSimulation.data.monthlyCashflowAfter)}
                    />
                    {expenseSimulation.data.debtCalculation ? (
                      <>
                        <ResultMetric
                          label="Total harus dibayar"
                          value={moneyFormatter.format(expenseSimulation.data.debtCalculation.totalPayable)}
                        />
                        <ResultMetric
                          label="Estimasi lunas"
                          value={formatDate(expenseSimulation.data.debtCalculation.payoffDate)}
                        />
                      </>
                    ) : null}
                  </SimulationResultCard>
                ) : null}
                {expenseSimulation.data ? (
                  <div className="flex justify-end">
                    <Button className="rounded-full" onClick={() => expenseSimulation.reset()} type="button" variant="outline">
                      Reset Hasil
                    </Button>
                  </div>
                ) : null}
              </>
            ) : null}

            {activeTab === 'debt' ? (
              <>
                <DebtSimulationForm isSubmitting={debtSimulation.isPending} onSubmit={handleDebt} />
                {debtSimulation.data ? (
                  <SimulationResultCard
                    details={debtSimulation.data.details}
                    recommendation={debtSimulation.data.recommendation}
                    status={debtSimulation.data.status}
                    title={debtSimulation.data.debtName}
                  >
                    <ResultMetric
                      label="Total yang harus dibayar"
                      value={moneyFormatter.format(debtSimulation.data.calculation.totalPayable)}
                    />
                    <ResultMetric
                      label="Cicilan per periode"
                      value={moneyFormatter.format(debtSimulation.data.calculation.paymentPerPeriod)}
                    />
                    <ResultMetric
                      label="Total bunga"
                      value={moneyFormatter.format(debtSimulation.data.calculation.totalInterest)}
                    />
                    <ResultMetric
                      label="Estimasi lunas"
                      value={formatDate(debtSimulation.data.calculation.payoffDate)}
                    />
                    <ResultMetric
                      label="Cicilan bulanan setara"
                      value={moneyFormatter.format(debtSimulation.data.calculation.monthlyEquivalentPayment)}
                    />
                    <ResultMetric
                      label="Sisa uang bulanan"
                      value={moneyFormatter.format(debtSimulation.data.impact.monthlyMoneyLeftAfter)}
                    />
                  </SimulationResultCard>
                ) : null}
                {debtSimulation.data ? (
                  <div className="flex justify-end">
                    <Button className="rounded-full" onClick={() => debtSimulation.reset()} type="button" variant="outline">
                      Reset Hasil
                    </Button>
                  </div>
                ) : null}
              </>
            ) : null}

            {activeTab === 'goal' ? (
              <>
                {snapshot.goals.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border bg-card p-6 text-card-foreground">
                    <h2 className="font-semibold">Belum ada target tabungan aktif</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Buat target tabungan terlebih dahulu untuk mencoba simulasi tambahan tabungan.
                    </p>
                    <Button asChild className="mt-4 rounded-full" size="sm">
                      <Link to="/app/goals/new">Buat Target</Link>
                    </Button>
                  </div>
                ) : (
                  <GoalSavingSimulationForm
                    isSubmitting={goalSimulation.isPending}
                    onSubmit={handleGoal}
                    snapshot={snapshot}
                  />
                )}

                {goalSimulation.data ? (
                  <SimulationResultCard
                    details={goalSimulation.data.details}
                    recommendation={goalSimulation.data.recommendation}
                    status={goalSimulation.data.status}
                    title={goalSimulation.data.goalName}
                  >
                    <ResultMetric
                      label="Target sebelum simulasi"
                      value={formatMonths(goalSimulation.data.monthsToTargetBefore)}
                    />
                    <ResultMetric
                      label="Target setelah simulasi"
                      value={formatMonths(goalSimulation.data.monthsToTargetAfter)}
                    />
                    <ResultMetric
                      label="Lebih cepat"
                      value={formatMonths(goalSimulation.data.estimatedMonthsFaster)}
                    />
                    <ResultMetric
                      label="Estimasi tanggal tercapai"
                      value={estimateDateFromMonths(goalSimulation.data.monthsToTargetAfter)}
                    />
                    <ResultMetric
                      label="Dampak uang bulanan"
                      value={moneyFormatter.format(goalSimulation.data.monthlyImpact * -1)}
                    />
                  </SimulationResultCard>
                ) : null}
                {goalSimulation.data ? (
                  <div className="flex justify-end">
                    <Button className="rounded-full" onClick={() => goalSimulation.reset()} type="button" variant="outline">
                      Reset Hasil
                    </Button>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}

function StepIndicator({ activeStep }: { activeStep: number }) {
  const steps = [
    { label: 'Pilih', value: 1 },
    { label: 'Isi Detail', value: 2 },
    { label: 'Hasil', value: 3 }
  ];

  return (
    <div className="rounded-3xl border border-border bg-card p-3 shadow-sm">
      <div className="grid grid-cols-3 gap-2">
        {steps.map((step) => {
          const active = activeStep >= step.value;

          return (
            <div
              className={cn(
                'flex min-w-0 items-center justify-center gap-2 rounded-2xl px-2 py-2 text-xs font-semibold sm:text-sm',
                active ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground'
              )}
              key={step.value}
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-xs',
                  active ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'
                )}
              >
                {step.value}
              </span>
              <span className="truncate">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
