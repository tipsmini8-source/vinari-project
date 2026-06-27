import { ArrowLeft, Calculator } from 'lucide-react';
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

const percentFormatter = new Intl.NumberFormat('id-ID', {
  maximumFractionDigits: 0,
  style: 'percent'
});

const tabs: Array<{ label: string; value: SimulatorTab }> = [
  { label: 'Pengeluaran Besar', value: 'expense' },
  { label: 'Tambah Cicilan', value: 'debt' },
  { label: 'Tambah Tabungan', value: 'goal' }
];

function formatMonths(value: number | null) {
  if (value === null) {
    return '-';
  }

  return `${value} bulan`;
}

function formatRatio(value: number | null) {
  if (value === null) {
    return '-';
  }

  return percentFormatter.format(value);
}

export function DecisionSimulatorPage() {
  const [activeTab, setActiveTab] = useState<SimulatorTab>('expense');
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const snapshotQuery = useDecisionSimulatorSnapshot(workspace?.id);
  const snapshot = snapshotQuery.data;
  const expenseSimulation = useSimulateExpense(snapshot);
  const debtSimulation = useSimulateDebt(snapshot);
  const goalSimulation = useSimulateGoalSaving(snapshot);

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

  return (
    <main className="min-h-svh bg-background px-4 py-8 text-foreground">
      <section className="mx-auto w-full max-w-5xl">
        <div className="mb-6">
          <Button asChild className="mb-3" size="sm" variant="ghost">
            <Link to="/app">
              <ArrowLeft className="size-4" />
              Kembali
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-primary">
            <Calculator className="size-5" />
            <p className="text-sm font-medium">{workspace.name}</p>
          </div>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">Decision Simulator</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Simulasikan keputusan finansial tanpa mengubah data asli workspace.
          </p>
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
            <div className="grid gap-2 rounded-md border border-border bg-card p-2 shadow-sm sm:grid-cols-3">
              {tabs.map((tab) => (
                <button
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    activeTab === tab.value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
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
                    recommendation={expenseSimulation.data.recommendation}
                    status={expenseSimulation.data.status}
                    title={expenseSimulation.data.decisionName}
                  >
                    <ResultMetric
                      label="Saldo setelah keputusan"
                      value={moneyFormatter.format(expenseSimulation.data.estimatedBalanceAfter)}
                    />
                    <ResultMetric
                      label="Dampak cashflow bulan ini"
                      value={moneyFormatter.format(expenseSimulation.data.cashflowImpactThisMonth)}
                    />
                    <ResultMetric
                      label="Health score awal"
                      value={`${expenseSimulation.data.financialHealthBefore}/100`}
                    />
                    <ResultMetric
                      label="Health score simulasi"
                      value={`${expenseSimulation.data.financialHealthAfter}/100`}
                    />
                  </SimulationResultCard>
                ) : null}
              </>
            ) : null}

            {activeTab === 'debt' ? (
              <>
                <DebtSimulationForm isSubmitting={debtSimulation.isPending} onSubmit={handleDebt} />
                {debtSimulation.data ? (
                  <SimulationResultCard
                    recommendation={debtSimulation.data.recommendation}
                    status={debtSimulation.data.status}
                    title={debtSimulation.data.debtName}
                  >
                    <ResultMetric
                      label="Tambahan kewajiban bulanan"
                      value={moneyFormatter.format(debtSimulation.data.additionalMonthlyObligation)}
                    />
                    <ResultMetric
                      label="Estimasi debt ratio"
                      value={formatRatio(debtSimulation.data.estimatedDebtRatio)}
                    />
                    <ResultMetric label="Health score awal" value={`${debtSimulation.data.financialHealthBefore}/100`} />
                    <ResultMetric label="Health score simulasi" value={`${debtSimulation.data.financialHealthAfter}/100`} />
                  </SimulationResultCard>
                ) : null}
              </>
            ) : null}

            {activeTab === 'goal' ? (
              <>
                {snapshot.goals.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border bg-card p-6 text-card-foreground">
                    <h2 className="font-semibold">Belum ada goal aktif</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Buat goal terlebih dahulu untuk mensimulasikan tambahan tabungan.
                    </p>
                    <Button asChild className="mt-4" size="sm">
                      <Link to="/app/goals/new">Buat Goal</Link>
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
                      label="Dampak cashflow"
                      value={moneyFormatter.format(goalSimulation.data.cashflowImpact)}
                    />
                  </SimulationResultCard>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}
