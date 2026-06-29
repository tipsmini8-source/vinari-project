import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';

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
  'flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-base text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function optionalNumber(value: unknown) {
  return value === '' || value === null || value === undefined ? undefined : Number(value);
}

function defaultInstallmentValues() {
  return {
    calculationMode: 'by_tenor' as const,
    downPayment: 0,
    frequency: 'monthly' as const,
    interestPercent: 0,
    interestPeriod: 'total' as const,
    interestType: 'none' as const,
    paymentPerPeriod: undefined,
    tenurePeriods: 12
  };
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

function FormShell({
  children,
  description,
  isSubmitting,
  submitLabel = 'Lihat Dampak',
  title
}: {
  children: React.ReactNode;
  description: string;
  isSubmitting: boolean;
  submitLabel?: string;
  title: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Langkah 2</p>
        <h2 className="mt-1 text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {children}
      <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto]">
        <Button
          className="w-full rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          {isSubmitting ? 'Menghitung...' : submitLabel}
        </Button>
        <Button className="rounded-2xl" disabled={isSubmitting} type="reset" variant="outline">
          Reset
        </Button>
      </div>
    </div>
  );
}

function FormStepSection({
  children,
  description,
  step,
  title
}: {
  children: React.ReactNode;
  description: string;
  step: string;
  title: string;
}) {
  return (
    <section className="rounded-3xl border border-border bg-background/65 p-4">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{step}</p>
        <h3 className="mt-1 font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function InstallmentFields({
  calculationMode,
  errors,
  interestType,
  register
}: {
  calculationMode: 'by_tenor' | 'by_payment';
  errors: Record<string, { message?: string } | undefined>;
  interestType: 'none' | 'flat';
  register: ReturnType<typeof useForm<DebtSimulationInput>>['register'];
}) {
  return (
    <div className="space-y-4">
      <FormStepSection
        description="Isi uang muka, bunga, dan seberapa sering cicilan dibayar."
        step="Bagian 1"
        title="Data Hutang"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="downPayment">DP / uang muka</Label>
            <Input
              className="h-12 rounded-xl text-base"
              id="downPayment"
              min="0"
              step="1000"
              type="number"
              {...register('downPayment', { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">Opsional. Isi 0 jika tidak ada DP.</p>
            <FieldError message={errors.downPayment?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frekuensi bayar</Label>
            <select className={selectClassName} id="frequency" {...register('frequency')}>
              <option value="daily">Harian</option>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
            </select>
            <FieldError message={errors.frequency?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestType">Jenis bunga</Label>
            <select className={selectClassName} id="interestType" {...register('interestType')}>
              <option value="none">Tanpa bunga</option>
              <option value="flat">Bunga flat</option>
            </select>
            <FieldError message={errors.interestType?.message} />
          </div>

          {interestType === 'flat' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="interestPercent">Persentase bunga</Label>
                <Input
                  className="h-12 rounded-xl text-base"
                  id="interestPercent"
                  min="0"
                  step="0.01"
                  type="number"
                  {...register('interestPercent', { valueAsNumber: true })}
                />
                <FieldError message={errors.interestPercent?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestPeriod">Periode bunga</Label>
                <select className={selectClassName} id="interestPeriod" {...register('interestPeriod')}>
                  <option value="total">Total</option>
                  <option value="monthly">Per bulan</option>
                  <option value="yearly">Per tahun</option>
                </select>
                <FieldError message={errors.interestPeriod?.message} />
              </div>
            </>
          ) : null}
        </div>
      </FormStepSection>

      <FormStepSection
        description="Pilih cara Vinari menghitung: dari lama cicilan atau dari kemampuan bayar kamu."
        step="Bagian 2"
        title="Cara Menghitung"
      >
        <div className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="rounded-2xl border border-border bg-muted/30 p-3">
              <input className="sr-only" type="radio" value="by_tenor" {...register('calculationMode')} />
              <span className="block font-semibold">Hitung cicilan</span>
              <span className="mt-1 block text-sm text-muted-foreground">
                Saya tahu lama cicilan, Vinari hitungkan bayar per periode.
              </span>
            </label>
            <label className="rounded-2xl border border-border bg-muted/30 p-3">
              <input className="sr-only" type="radio" value="by_payment" {...register('calculationMode')} />
              <span className="block font-semibold">Hitung lama lunas</span>
              <span className="mt-1 block text-sm text-muted-foreground">
                Saya tahu kemampuan bayar, Vinari hitungkan kapan lunas.
              </span>
            </label>
          </div>
          <FieldError message={errors.calculationMode?.message} />

          {calculationMode === 'by_tenor' ? (
            <div className="space-y-2">
              <Label htmlFor="tenurePeriods">Tenor / lama cicilan</Label>
              <Input
                className="h-12 rounded-xl text-base"
                id="tenurePeriods"
                min="1"
                step="1"
                type="number"
                {...register('tenurePeriods', { setValueAs: optionalNumber })}
              />
              <p className="text-xs text-muted-foreground">Satuan mengikuti frekuensi bayar. Misal 12 untuk 12 bulan.</p>
              <FieldError message={errors.tenurePeriods?.message} />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="paymentPerPeriod">Kemampuan bayar per periode</Label>
              <Input
                className="h-12 rounded-xl text-base"
                id="paymentPerPeriod"
                min="1"
                step="1000"
                type="number"
                {...register('paymentPerPeriod', { setValueAs: optionalNumber })}
              />
              <FieldError message={errors.paymentPerPeriod?.message} />
            </div>
          )}
        </div>
      </FormStepSection>

      <FormStepSection
        description="Setelah dihitung, Vinari akan menampilkan cicilan bulanan, sisa uang bulanan, dan status keputusan."
        step="Bagian 3"
        title="Dampak ke Keuangan"
      >
        <div className="rounded-2xl bg-primary/10 p-3 text-sm leading-6 text-muted-foreground">
          Simulasi ini hanya perkiraan. Tidak ada transaksi, hutang, saldo, atau target yang akan berubah.
        </div>
      </FormStepSection>
    </div>
  );
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
    control,
    formState: { errors },
    handleSubmit,
    register
  } = useForm<ExpenseSimulationInput>({
    defaultValues: {
      amount: 0,
      decisionName: '',
      paymentMode: 'one_time',
      plannedDate: today(),
      walletId: snapshot.wallets[0]?.id ?? '',
      ...defaultInstallmentValues()
    },
    resolver: zodResolver(expenseSimulationSchema)
  });
  const paymentMode = useWatch({ control, name: 'paymentMode' });
  const calculationMode = useWatch({ control, name: 'calculationMode' });
  const interestType = useWatch({ control, name: 'interestType' });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormShell
        description="Isi nominal dan cara bayarnya. Kalau pilih cicilan, Vinari akan menghitung bunga, cicilan, dan dampaknya."
        isSubmitting={isSubmitting}
        title="Isi detail pengeluaran"
      >
        <FormStepSection
          description="Isi nama, nominal, dompet, dan tanggal rencana."
          step="Bagian 1"
          title="Data Keputusan"
        >
          <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="decisionName">Nama keputusan</Label>
            <Input className="h-12 rounded-xl text-base" id="decisionName" placeholder="Beli HP" {...register('decisionName')} />
            <FieldError message={errors.decisionName?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Nominal pengeluaran</Label>
            <Input className="h-12 rounded-xl text-base" id="amount" min="0" step="1000" type="number" {...register('amount', { valueAsNumber: true })} />
            <FieldError message={errors.amount?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="walletId">Bayar dari dompet mana?</Label>
            <select className={selectClassName} id="walletId" {...register('walletId')}>
              {snapshot.wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
            <FieldError message={errors.walletId?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plannedDate">Tanggal rencana</Label>
            <Input className="h-12 rounded-xl text-base" id="plannedDate" type="date" {...register('plannedDate')} />
            <FieldError message={errors.plannedDate?.message} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="paymentMode">Cara bayar</Label>
            <select className={selectClassName} id="paymentMode" {...register('paymentMode')}>
              <option value="one_time">Sekali bayar</option>
              <option value="installment">Cicilan</option>
            </select>
            <FieldError message={errors.paymentMode?.message} />
          </div>
          </div>
        </FormStepSection>

        {paymentMode === 'installment' ? (
          <div className="mt-4">
            <InstallmentFields
              calculationMode={calculationMode}
              errors={errors}
              interestType={interestType}
              register={register as ReturnType<typeof useForm<DebtSimulationInput>>['register']}
            />
          </div>
        ) : null}
      </FormShell>
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
    control,
    formState: { errors },
    handleSubmit,
    register
  } = useForm<DebtSimulationInput>({
    defaultValues: {
      debtName: '',
      startDate: today(),
      totalDebt: 0,
      ...defaultInstallmentValues()
    },
    resolver: zodResolver(debtSimulationSchema)
  });
  const calculationMode = useWatch({ control, name: 'calculationMode' });
  const interestType = useWatch({ control, name: 'interestType' });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormShell
        description="Masukkan harga barang atau total hutang, lalu pilih apakah kamu ingin menghitung cicilan atau lama lunas."
        isSubmitting={isSubmitting}
        title="Isi detail cicilan baru"
      >
        <FormStepSection
          description="Masukkan nama cicilan, total hutang, dan kapan cicilan mulai dihitung."
          step="Bagian 1"
          title="Data Hutang"
        >
          <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="debtName">Nama cicilan</Label>
            <Input className="h-12 rounded-xl text-base" id="debtName" placeholder="Cicilan motor" {...register('debtName')} />
            <FieldError message={errors.debtName?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalDebt">Total hutang / harga barang</Label>
            <Input className="h-12 rounded-xl text-base" id="totalDebt" min="0" step="1000" type="number" {...register('totalDebt', { valueAsNumber: true })} />
            <FieldError message={errors.totalDebt?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Mulai kapan?</Label>
            <Input className="h-12 rounded-xl text-base" id="startDate" type="date" {...register('startDate')} />
            <FieldError message={errors.startDate?.message} />
          </div>
          </div>
        </FormStepSection>

        <div className="mt-4">
          <InstallmentFields
            calculationMode={calculationMode}
            errors={errors}
            interestType={interestType}
            register={register}
          />
        </div>
      </FormShell>
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
    control,
    formState: { errors },
    handleSubmit,
    register
  } = useForm<GoalSavingSimulationInput>({
    defaultValues: {
      additionalSaving: 0,
      frequency: 'monthly',
      goalId: snapshot.goals[0]?.id ?? '',
      reduceWallet: false,
      startDate: today(),
      walletId: snapshot.wallets[0]?.id ?? ''
    },
    resolver: zodResolver(goalSavingSimulationSchema)
  });
  const reduceWallet = useWatch({ control, name: 'reduceWallet' });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormShell
        description="Simulasikan tambahan tabungan tanpa mengubah saldo atau progres target asli."
        isSubmitting={isSubmitting || snapshot.goals.length === 0}
        title="Isi detail tambahan tabungan"
      >
        <FormStepSection
          description="Pilih target dan rencana tambahan tabungan."
          step="Bagian 1"
          title="Data Target"
        >
          <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="goalId">Target tabungan</Label>
            <select className={selectClassName} id="goalId" {...register('goalId')}>
              {snapshot.goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.name}
                </option>
              ))}
            </select>
            <FieldError message={errors.goalId?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalSaving">Nominal tambahan</Label>
            <Input className="h-12 rounded-xl text-base" id="additionalSaving" min="0" step="1000" type="number" {...register('additionalSaving', { valueAsNumber: true })} />
            <FieldError message={errors.additionalSaving?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frekuensi</Label>
            <select className={selectClassName} id="frequency" {...register('frequency')}>
              <option value="once">Sekali</option>
              <option value="daily">Harian</option>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
            </select>
            <FieldError message={errors.frequency?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Mulai tanggal</Label>
            <Input className="h-12 rounded-xl text-base" id="startDate" type="date" {...register('startDate')} />
            <FieldError message={errors.startDate?.message} />
          </div>
          </div>
        </FormStepSection>

        <label className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-muted/35 p-3 text-sm">
          <input className="mt-1" type="checkbox" {...register('reduceWallet')} />
          <span>
            <span className="block font-medium text-foreground">Anggap mengurangi saldo dompet</span>
            <span className="text-muted-foreground">Ini hanya untuk simulasi dan tidak mengubah saldo asli.</span>
          </span>
        </label>

        {reduceWallet ? (
          <div className="mt-4 space-y-2">
            <Label htmlFor="walletId">Dompet sumber</Label>
            <select className={selectClassName} id="walletId" {...register('walletId')}>
              {snapshot.wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
            <FieldError message={errors.walletId?.message} />
          </div>
        ) : null}
      </FormShell>
    </form>
  );
}
