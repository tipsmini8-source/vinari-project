import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import {
  debtSimulationSchema,
  expenseSimulationSchema,
  goalSavingSimulationSchema
} from '@features/decision-simulator/schemas/decision-simulator.schemas';
import type {
  DebtSimulationInput,
  ExpenseSimulationInput,
  GoalSavingSimulationInput,
  SimulatorSnapshot
} from '@features/decision-simulator/types/decision-simulator.types';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';

const selectClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function optionalNumber(value: unknown) {
  return value === '' || value === null || value === undefined ? undefined : Number(value);
}

export function ExpenseSimulationForm({
  isSubmitting,
  onSubmit,
  snapshot
}: {
  isSubmitting: boolean;
  onSubmit: (input: ExpenseSimulationInput) => Promise<void>;
  snapshot: SimulatorSnapshot;
}) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    watch
  } = useForm<ExpenseSimulationInput>({
    resolver: zodResolver(expenseSimulationSchema),
    defaultValues: {
      decisionName: '',
      amount: 0,
      walletId: snapshot.wallets[0]?.id ?? '',
      plannedDate: today(),
      paymentMode: 'one_time'
    }
  });
  const paymentMode = watch('paymentMode');

  return (
    <form className="rounded-md border border-border bg-card p-5 shadow-sm" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="decisionName">Nama keputusan</Label>
          <Input id="decisionName" placeholder="Beli HP" {...register('decisionName')} />
          {errors.decisionName ? <p className="text-sm text-destructive">{errors.decisionName.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Nominal pengeluaran</Label>
          <Input id="amount" min="0" step="1000" type="number" {...register('amount', { valueAsNumber: true })} />
          {errors.amount ? <p className="text-sm text-destructive">{errors.amount.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="walletId">Wallet terdampak</Label>
          <select className={selectClassName} id="walletId" {...register('walletId')}>
            {snapshot.wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </select>
          {errors.walletId ? <p className="text-sm text-destructive">{errors.walletId.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="plannedDate">Tanggal rencana</Label>
          <Input id="plannedDate" type="date" {...register('plannedDate')} />
          {errors.plannedDate ? <p className="text-sm text-destructive">{errors.plannedDate.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentMode">Cara bayar</Label>
          <select className={selectClassName} id="paymentMode" {...register('paymentMode')}>
            <option value="one_time">Sekali bayar</option>
            <option value="installment">Cicilan</option>
          </select>
          {errors.paymentMode ? <p className="text-sm text-destructive">{errors.paymentMode.message}</p> : null}
        </div>

        {paymentMode === 'installment' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="monthlyInstallment">Cicilan per bulan</Label>
              <Input
                id="monthlyInstallment"
                min="0"
                step="1000"
                type="number"
                {...register('monthlyInstallment', { setValueAs: optionalNumber })}
              />
              {errors.monthlyInstallment ? (
                <p className="text-sm text-destructive">{errors.monthlyInstallment.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="installmentDurationMonths">Durasi bulan</Label>
              <Input
                id="installmentDurationMonths"
                min="1"
                step="1"
                type="number"
                {...register('installmentDurationMonths', { setValueAs: optionalNumber })}
              />
              {errors.installmentDurationMonths ? (
                <p className="text-sm text-destructive">{errors.installmentDurationMonths.message}</p>
              ) : null}
            </div>
          </>
        ) : null}
      </div>

      <Button className="mt-5" disabled={isSubmitting} type="submit">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Simulasikan
      </Button>
    </form>
  );
}

export function DebtSimulationForm({
  isSubmitting,
  onSubmit
}: {
  isSubmitting: boolean;
  onSubmit: (input: DebtSimulationInput) => Promise<void>;
}) {
  const {
    formState: { errors },
    handleSubmit,
    register
  } = useForm<DebtSimulationInput>({
    resolver: zodResolver(debtSimulationSchema),
    defaultValues: {
      debtName: '',
      totalDebt: 0,
      monthlyInstallment: 0,
      durationMonths: 12,
      startDate: today()
    }
  });

  return (
    <form className="rounded-md border border-border bg-card p-5 shadow-sm" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="debtName">Nama hutang</Label>
          <Input id="debtName" placeholder="Cicilan motor" {...register('debtName')} />
          {errors.debtName ? <p className="text-sm text-destructive">{errors.debtName.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalDebt">Total hutang</Label>
          <Input id="totalDebt" min="0" step="1000" type="number" {...register('totalDebt', { valueAsNumber: true })} />
          {errors.totalDebt ? <p className="text-sm text-destructive">{errors.totalDebt.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthlyInstallmentDebt">Cicilan per bulan</Label>
          <Input
            id="monthlyInstallmentDebt"
            min="0"
            step="1000"
            type="number"
            {...register('monthlyInstallment', { valueAsNumber: true })}
          />
          {errors.monthlyInstallment ? (
            <p className="text-sm text-destructive">{errors.monthlyInstallment.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="durationMonths">Durasi bulan</Label>
          <Input
            id="durationMonths"
            min="1"
            step="1"
            type="number"
            {...register('durationMonths', { valueAsNumber: true })}
          />
          {errors.durationMonths ? <p className="text-sm text-destructive">{errors.durationMonths.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Tanggal mulai</Label>
          <Input id="startDate" type="date" {...register('startDate')} />
          {errors.startDate ? <p className="text-sm text-destructive">{errors.startDate.message}</p> : null}
        </div>
      </div>

      <Button className="mt-5" disabled={isSubmitting} type="submit">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Simulasikan
      </Button>
    </form>
  );
}

export function GoalSavingSimulationForm({
  isSubmitting,
  onSubmit,
  snapshot
}: {
  isSubmitting: boolean;
  onSubmit: (input: GoalSavingSimulationInput) => Promise<void>;
  snapshot: SimulatorSnapshot;
}) {
  const {
    formState: { errors },
    handleSubmit,
    register
  } = useForm<GoalSavingSimulationInput>({
    resolver: zodResolver(goalSavingSimulationSchema),
    defaultValues: {
      goalId: snapshot.goals[0]?.id ?? '',
      additionalMonthlySaving: 0
    }
  });

  return (
    <form className="rounded-md border border-border bg-card p-5 shadow-sm" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="goalId">Goal</Label>
          <select className={selectClassName} id="goalId" {...register('goalId')}>
            {snapshot.goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.name}
              </option>
            ))}
          </select>
          {errors.goalId ? <p className="text-sm text-destructive">{errors.goalId.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalMonthlySaving">Tambahan tabungan bulanan</Label>
          <Input
            id="additionalMonthlySaving"
            min="0"
            step="1000"
            type="number"
            {...register('additionalMonthlySaving', { valueAsNumber: true })}
          />
          {errors.additionalMonthlySaving ? (
            <p className="text-sm text-destructive">{errors.additionalMonthlySaving.message}</p>
          ) : null}
        </div>
      </div>

      <Button className="mt-5" disabled={isSubmitting || snapshot.goals.length === 0} type="submit">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Simulasikan
      </Button>
    </form>
  );
}
