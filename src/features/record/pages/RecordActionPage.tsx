import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowDownCircle,
  ArrowLeft,
  ArrowRightLeft,
  ArrowUpCircle,
  CalendarClock,
  CreditCard,
  Landmark,
  Loader2,
  Repeat,
  Target
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { z } from 'zod';

import { useWorkspace } from '@/core/workspace';
import { DebtPaymentForm } from '@features/debt/components/DebtPaymentForm';
import { useAddDebtPayment, useDebtWallets, useDebts } from '@features/debt/hooks/useDebts';
import type { DebtPaymentFormInput, DebtWithProgress } from '@features/debt/types/debt.types';
import { useAddGoalContribution, useGoalWallets, useGoals } from '@features/goal/hooks/useGoals';
import type { GoalContributionFormInput, GoalWithProgress } from '@features/goal/types/goal.types';
import {
  useRecurringTransactions,
  useSubscriptions,
  useUpdateRecurringTransaction,
  useUpdateSubscription
} from '@features/recurring/hooks/useRecurring';
import type { RecurringTransaction, ScheduleCycle, Subscription } from '@features/recurring/types/recurring.types';
import { TransactionForm } from '@features/transaction/components/TransactionForm';
import { useCreateTransaction, useTransactionReferences } from '@features/transaction/hooks/useTransactions';
import type {
  TransactionFormInput,
  TransactionReferenceCategory,
  TransactionReferenceWallet,
  TransactionType
} from '@features/transaction/types/transaction.types';
import {
  QuickExpensePaymentForm,
  type QuickExpensePaymentInput
} from '@shared/components/QuickExpensePaymentForm';
import { Button } from '@shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/ui/card';
import { GlobalLoading } from '@shared/ui/global-loading';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { useToast } from '@shared/ui/use-toast';

type RecordMode = 'income' | 'expense' | 'transfer' | 'debt' | 'subscription' | 'goal' | 'recurring';

const actionItems: Array<{
  description: string;
  href: string;
  icon: typeof ArrowDownCircle;
  mode: RecordMode;
  title: string;
}> = [
  {
    description: 'Gaji, bonus, atau pemasukan lain.',
    href: '/app/record?mode=income',
    icon: ArrowDownCircle,
    mode: 'income',
    title: 'Catat Uang Masuk'
  },
  {
    description: 'Belanja, makan, transport, dan kebutuhan harian.',
    href: '/app/record?mode=expense',
    icon: ArrowUpCircle,
    mode: 'expense',
    title: 'Catat Uang Keluar'
  },
  {
    description: 'Pindahkan saldo dari satu dompet ke dompet lain.',
    href: '/app/record?mode=transfer',
    icon: ArrowRightLeft,
    mode: 'transfer',
    title: 'Pindah Saldo'
  },
  {
    description: 'Kurangi sisa hutang dan catat uang keluar.',
    href: '/app/record?mode=debt',
    icon: Landmark,
    mode: 'debt',
    title: 'Bayar Hutang / Cicilan'
  },
  {
    description: 'Bayar tagihan rutin dan majukan jatuh tempo.',
    href: '/app/record?mode=subscription',
    icon: CreditCard,
    mode: 'subscription',
    title: 'Bayar Langganan'
  },
  {
    description: 'Tambah progres target tabungan.',
    href: '/app/record?mode=goal',
    icon: Target,
    mode: 'goal',
    title: 'Tambah Tabungan Target'
  },
  {
    description: 'Jalankan template transaksi berulang.',
    href: '/app/record?mode=recurring',
    icon: Repeat,
    mode: 'recurring',
    title: 'Catat Transaksi Rutin'
  }
];

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  maximumFractionDigits: 0,
  style: 'currency'
});

const goalRecordSchema = z
  .object({
    amount: z.number().min(0.01, 'Nominal tabungan wajib lebih besar dari 0.'),
    contributionDate: z.string().min(1, 'Tanggal wajib diisi.'),
    note: z.string().optional(),
    reduceWallet: z.boolean(),
    walletId: z.string().optional()
  })
  .superRefine((value, context) => {
    if (value.reduceWallet && !value.walletId) {
      context.addIssue({
        code: 'custom',
        message: 'Pilih dompet jika tabungan ingin mengurangi saldo.',
        path: ['walletId']
      });
    }
  });

type GoalRecordInput = z.infer<typeof goalRecordSchema>;

const recurringRunSchema = z.object({
  amount: z.number().min(0.01, 'Nominal wajib lebih besar dari 0.'),
  categoryId: z.string().min(1, 'Kategori wajib dipilih.'),
  note: z.string().optional(),
  transactionDate: z.string().min(1, 'Tanggal wajib diisi.'),
  walletId: z.string().min(1, 'Dompet wajib dipilih.')
});

type RecurringRunInput = z.infer<typeof recurringRunSchema>;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function canManage(role: string | undefined) {
  return role === 'owner' || role === 'partner' || role === 'member';
}

function advanceDate(date: string, cycle: ScheduleCycle) {
  const nextDate = new Date(date);

  if (cycle === 'daily') {
    nextDate.setDate(nextDate.getDate() + 1);
  } else if (cycle === 'weekly') {
    nextDate.setDate(nextDate.getDate() + 7);
  } else if (cycle === 'yearly') {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  } else {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }

  return nextDate.toISOString().slice(0, 10);
}

function getSafeMode(value: string | null): RecordMode | null {
  return actionItems.some((item) => item.mode === value) ? (value as RecordMode) : null;
}

function findExpenseCategory(categories: TransactionReferenceCategory[], pattern: RegExp) {
  const expenseCategories = categories.filter((category) => category.type === 'expense');

  return expenseCategories.find((category) => pattern.test(category.name)) ?? expenseCategories[0];
}

export function RecordActionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = getSafeMode(searchParams.get('mode'));
  const { loading, workspace } = useWorkspace();
  const { toast } = useToast();
  const references = useTransactionReferences(workspace?.id);
  const debtsQuery = useDebts(workspace?.id);
  const debtWallets = useDebtWallets(workspace?.id);
  const goalsQuery = useGoals(workspace?.id);
  const goalWallets = useGoalWallets(workspace?.id);
  const subscriptionsQuery = useSubscriptions(workspace?.id);
  const recurringQuery = useRecurringTransactions(workspace?.id);
  const createTransaction = useCreateTransaction(workspace?.id);
  const addDebtPayment = useAddDebtPayment(workspace?.id);
  const addGoalContribution = useAddGoalContribution(workspace?.id);
  const updateSubscription = useUpdateSubscription(workspace?.id);
  const updateRecurring = useUpdateRecurringTransaction(workspace?.id);
  const canSubmit = canManage(workspace?.role);
  const categories = references.categories.data ?? [];
  const wallets = references.wallets.data ?? [];

  const expenseCategories = useMemo(() => categories.filter((category) => category.type === 'expense'), [categories]);
  const debtCategory = findExpenseCategory(categories, /hutang|cicilan|pinjaman/i);
  const subscriptionCategory = findExpenseCategory(categories, /langganan|subscription|tagihan/i);
  const goalCategory = findExpenseCategory(categories, /tabungan|target|saving/i);

  if (loading) {
    return <GlobalLoading />;
  }

  if (!workspace) {
    return <Navigate replace to="/onboarding" />;
  }

  const handleManualSubmit = async (input: TransactionFormInput) => {
    try {
      await createTransaction.mutateAsync(input);
      toast({ title: 'Catatan uang disimpan' });
      void navigate('/app/transactions');
    } catch (error) {
      toast({
        title: 'Gagal menyimpan catatan',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const handleDebtPayment = async (debt: DebtWithProgress, input: DebtPaymentFormInput) => {
    if (!input.walletId) {
      toast({
        title: 'Dompet wajib dipilih',
        description: 'Pilih dompet agar pembayaran hutang ikut tercatat sebagai uang keluar.',
        variant: 'destructive'
      });
      return;
    }

    if (!debtCategory) {
      toast({
        title: 'Kategori belum tersedia',
        description: 'Tambahkan kategori uang keluar untuk hutang atau cicilan terlebih dulu.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await addDebtPayment.mutateAsync({ debtId: debt.id, input });
      await createTransaction.mutateAsync({
        amount: input.amount,
        categoryId: debtCategory.id,
        destinationWalletId: '',
        note: input.note || `Pembayaran hutang: ${debt.name}`,
        title: `Bayar ${debt.name}`,
        transactionDate: input.paymentDate,
        type: 'expense',
        walletId: input.walletId
      });
      toast({ title: 'Pembayaran hutang dicatat' });
      void navigate('/app/debts');
    } catch (error) {
      toast({
        title: 'Gagal mencatat pembayaran',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const handleSubscriptionPayment = async (subscription: Subscription, input: QuickExpensePaymentInput) => {
    try {
      await createTransaction.mutateAsync({
        amount: input.amount,
        categoryId: input.categoryId,
        destinationWalletId: '',
        note: input.note || `Pembayaran langganan: ${subscription.name}`,
        title: `Bayar ${subscription.name}`,
        transactionDate: input.paymentDate,
        type: 'expense',
        walletId: input.walletId
      });
      await updateSubscription.mutateAsync({
        input: {
          amount: subscription.amount,
          billingCycle: subscription.billing_cycle,
          categoryId: subscription.category_id ?? input.categoryId,
          isActive: subscription.is_active,
          name: subscription.name,
          nextDueDate: advanceDate(subscription.next_due_date, subscription.billing_cycle),
          note: subscription.note ?? '',
          walletId: subscription.wallet_id ?? input.walletId
        },
        subscriptionId: subscription.id
      });
      toast({ title: 'Pembayaran langganan dicatat' });
      void navigate('/app/subscriptions');
    } catch (error) {
      toast({
        title: 'Gagal mencatat langganan',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const handleGoalContribution = async (goal: GoalWithProgress, input: GoalRecordInput) => {
    const contributionInput: GoalContributionFormInput = {
      amount: input.amount,
      contributionDate: input.contributionDate,
      note: input.note,
      walletId: input.walletId
    };

    if (input.reduceWallet && !goalCategory) {
      toast({
        title: 'Kategori belum tersedia',
        description: 'Tambahkan kategori uang keluar untuk tabungan atau target terlebih dulu.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await addGoalContribution.mutateAsync({ goalId: goal.id, input: contributionInput });

      if (input.reduceWallet && input.walletId && goalCategory) {
        await createTransaction.mutateAsync({
          amount: input.amount,
          categoryId: goalCategory.id,
          destinationWalletId: '',
          note: input.note || `Tabungan untuk target: ${goal.name}`,
          title: `Tabungan ${goal.name}`,
          transactionDate: input.contributionDate,
          type: 'expense',
          walletId: input.walletId
        });
      }

      toast({ title: 'Tabungan target ditambahkan' });
      void navigate('/app/goals');
    } catch (error) {
      toast({
        title: 'Gagal menambah tabungan',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const handleRecurringRun = async (item: RecurringTransaction, input: RecurringRunInput) => {
    try {
      await createTransaction.mutateAsync({
        amount: input.amount,
        categoryId: input.categoryId,
        destinationWalletId: '',
        note: input.note || `Dari transaksi rutin: ${item.title}`,
        title: item.title,
        transactionDate: input.transactionDate,
        type: item.type,
        walletId: input.walletId
      });
      await updateRecurring.mutateAsync({
        input: {
          amount: item.amount,
          categoryId: item.category_id ?? input.categoryId,
          endDate: item.end_date ?? '',
          frequency: item.frequency,
          isActive: item.is_active,
          nextRunDate: advanceDate(item.next_run_date, item.frequency),
          note: item.note ?? '',
          startDate: item.start_date,
          title: item.title,
          type: item.type,
          walletId: item.wallet_id ?? input.walletId
        },
        recurringId: item.id
      });
      toast({ title: 'Transaksi rutin dicatat' });
      void navigate('/app/recurring');
    } catch (error) {
      toast({
        title: 'Gagal mencatat transaksi rutin',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  const selectedAction = actionItems.find((item) => item.mode === mode);
  const manualType = mode === 'income' || mode === 'expense' || mode === 'transfer' ? mode : null;
  const manualTitle =
    manualType === 'income' ? 'Catat Uang Masuk' : manualType === 'transfer' ? 'Pindah Saldo' : 'Catat Uang Keluar';

  return (
    <main className="min-h-svh bg-background px-4 pb-28 pt-6 text-foreground sm:py-8">
      <section className="mx-auto w-full max-w-3xl">
        <Button asChild className="mb-4" size="sm" variant="ghost">
          <Link to="/app">
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>

        {!mode ? <RecordModePicker /> : null}

        {manualType ? (
          <Card>
            <CardHeader>
              <CardTitle>{manualTitle}</CardTitle>
              <CardDescription>Isi catatan uang dengan bahasa sederhana dan pilih dompet yang terdampak.</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionForm
                categories={categories}
                initialType={manualType as TransactionType}
                isSubmitting={createTransaction.isPending}
                onCancel={() => void navigate('/app')}
                onSubmit={handleManualSubmit}
                wallets={wallets}
              />
            </CardContent>
          </Card>
        ) : null}

        {mode && !manualType && !canSubmit ? (
          <Card>
            <CardHeader>
              <CardTitle>Akses terbatas</CardTitle>
              <CardDescription>Role viewer hanya bisa melihat data. Minta owner untuk mencatat pembayaran.</CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {mode === 'debt' && canSubmit ? (
          <DebtRecordSection
            debts={(debtsQuery.data ?? []).filter((debt) => debt.status === 'active' && debt.remaining_amount > 0)}
            isLoading={debtsQuery.isLoading || debtWallets.isLoading}
            isSubmitting={addDebtPayment.isPending || createTransaction.isPending}
            onSubmit={handleDebtPayment}
            wallets={debtWallets.data ?? []}
          />
        ) : null}

        {mode === 'subscription' && canSubmit ? (
          <SubscriptionRecordSection
            categories={expenseCategories}
            defaultCategoryId={subscriptionCategory?.id ?? ''}
            isLoading={subscriptionsQuery.isLoading || references.isLoading}
            isSubmitting={createTransaction.isPending || updateSubscription.isPending}
            onSubmit={handleSubscriptionPayment}
            subscriptions={(subscriptionsQuery.data ?? []).filter((item) => item.is_active)}
            wallets={wallets}
          />
        ) : null}

        {mode === 'goal' && canSubmit ? (
          <GoalRecordSection
            goals={(goalsQuery.data ?? []).filter((goal) => goal.status === 'active')}
            isLoading={goalsQuery.isLoading || goalWallets.isLoading}
            isSubmitting={addGoalContribution.isPending || createTransaction.isPending}
            onSubmit={handleGoalContribution}
            wallets={goalWallets.data ?? []}
          />
        ) : null}

        {mode === 'recurring' && canSubmit ? (
          <RecurringRecordSection
            categories={categories}
            isLoading={recurringQuery.isLoading || references.isLoading}
            isSubmitting={createTransaction.isPending || updateRecurring.isPending}
            onSubmit={handleRecurringRun}
            recurringItems={(recurringQuery.data ?? []).filter((item) => item.is_active)}
            wallets={wallets}
          />
        ) : null}

        {mode && !selectedAction ? <RecordModePicker /> : null}
      </section>
    </main>
  );
}

function RecordModePicker() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Catat Uang</CardTitle>
        <CardDescription>Pilih aksi yang sesuai agar data dompet, hutang, langganan, dan target tetap sinkron.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {actionItems.map(({ description, href, icon: Icon, title }) => (
          <Button asChild className="h-auto justify-start rounded-2xl p-4 text-left" key={href} variant="outline">
            <Link to={href}>
              <span className="mr-3 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{title}</span>
                <span className="mt-1 block whitespace-normal text-xs font-normal text-muted-foreground">{description}</span>
              </span>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

function SectionShell({
  children,
  description,
  icon: Icon,
  title
}: {
  children: React.ReactNode;
  description: string;
  icon: typeof ArrowDownCircle;
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="size-5" />
          </span>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function InlineState({ actionHref, actionLabel, message }: { actionHref?: string; actionLabel?: string; message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
      <p>{message}</p>
      {actionHref && actionLabel ? (
        <Button asChild className="mt-3 rounded-full" size="sm" variant="outline">
          <Link to={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}

function DebtRecordSection({
  debts,
  isLoading,
  isSubmitting,
  onSubmit,
  wallets
}: {
  debts: DebtWithProgress[];
  isLoading: boolean;
  isSubmitting: boolean;
  onSubmit: (debt: DebtWithProgress, input: DebtPaymentFormInput) => Promise<void>;
  wallets: Array<{ id: string; name: string; wallet_type: string }>;
}) {
  const [selectedDebtId, setSelectedDebtId] = useState('');
  const selectedDebt = debts.find((debt) => debt.id === selectedDebtId) ?? debts[0];

  useEffect(() => {
    if (!selectedDebtId && debts[0]) {
      setSelectedDebtId(debts[0].id);
    }
  }, [debts, selectedDebtId]);

  return (
    <SectionShell
      description="Pilih hutang aktif, bayar dari dompet, lalu Vinari akan mengurangi sisa hutang dan membuat catatan uang keluar."
      icon={Landmark}
      title="Bayar Hutang / Cicilan"
    >
      {isLoading ? <InlineState message="Memuat hutang aktif..." /> : null}
      {!isLoading && debts.length === 0 ? (
        <InlineState actionHref="/app/debts/new" actionLabel="Tambah Hutang" message="Belum ada hutang aktif yang bisa dibayar." />
      ) : null}
      {!isLoading && selectedDebt ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="debtId">Pilih hutang</Label>
            <select
              className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-base text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="debtId"
              onChange={(event) => setSelectedDebtId(event.target.value)}
              value={selectedDebt.id}
            >
              {debts.map((debt) => (
                <option key={debt.id} value={debt.id}>
                  {debt.name} - sisa {moneyFormatter.format(debt.remaining_amount)}
                </option>
              ))}
            </select>
          </div>
          <DebtPaymentForm
            defaultAmount={Math.min(selectedDebt.installment_amount ?? selectedDebt.remaining_amount, selectedDebt.remaining_amount)}
            defaultWalletId={wallets[0]?.id ?? ''}
            isSubmitting={isSubmitting}
            onSubmit={(input) => onSubmit(selectedDebt, input)}
            remainingAmount={selectedDebt.remaining_amount}
            submitLabel="Bayar Hutang"
            wallets={wallets}
          />
        </div>
      ) : null}
    </SectionShell>
  );
}

function SubscriptionRecordSection({
  categories,
  defaultCategoryId,
  isLoading,
  isSubmitting,
  onSubmit,
  subscriptions,
  wallets
}: {
  categories: TransactionReferenceCategory[];
  defaultCategoryId: string;
  isLoading: boolean;
  isSubmitting: boolean;
  onSubmit: (subscription: Subscription, input: QuickExpensePaymentInput) => Promise<void>;
  subscriptions: Subscription[];
  wallets: TransactionReferenceWallet[];
}) {
  const [selectedId, setSelectedId] = useState('');
  const selectedSubscription = subscriptions.find((item) => item.id === selectedId) ?? subscriptions[0];

  useEffect(() => {
    if (!selectedId && subscriptions[0]) {
      setSelectedId(subscriptions[0].id);
    }
  }, [selectedId, subscriptions]);

  return (
    <SectionShell
      description="Bayar tagihan langganan, catat uang keluar, lalu jadwal tagihan berikutnya akan dimajukan."
      icon={CreditCard}
      title="Bayar Langganan"
    >
      {isLoading ? <InlineState message="Memuat langganan aktif..." /> : null}
      {!isLoading && subscriptions.length === 0 ? (
        <InlineState
          actionHref="/app/subscriptions/new"
          actionLabel="Tambah Langganan"
          message="Belum ada langganan aktif yang bisa dibayar."
        />
      ) : null}
      {!isLoading && selectedSubscription ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subscriptionId">Pilih langganan</Label>
            <select
              className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-base text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="subscriptionId"
              onChange={(event) => setSelectedId(event.target.value)}
              value={selectedSubscription.id}
            >
              {subscriptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - {moneyFormatter.format(item.amount)}
                </option>
              ))}
            </select>
          </div>
          <QuickExpensePaymentForm
            categories={categories}
            defaultAmount={selectedSubscription.amount}
            defaultCategoryId={selectedSubscription.category_id ?? defaultCategoryId}
            defaultNote={`Pembayaran langganan: ${selectedSubscription.name}`}
            defaultWalletId={selectedSubscription.wallet_id ?? wallets[0]?.id ?? ''}
            isSubmitting={isSubmitting}
            onSubmit={(input) => onSubmit(selectedSubscription, input)}
            submitLabel="Bayar Langganan"
            wallets={wallets}
          />
        </div>
      ) : null}
    </SectionShell>
  );
}

function GoalRecordSection({
  goals,
  isLoading,
  isSubmitting,
  onSubmit,
  wallets
}: {
  goals: GoalWithProgress[];
  isLoading: boolean;
  isSubmitting: boolean;
  onSubmit: (goal: GoalWithProgress, input: GoalRecordInput) => Promise<void>;
  wallets: Array<{ id: string; name: string; wallet_type: string }>;
}) {
  const [selectedId, setSelectedId] = useState('');
  const selectedGoal = goals.find((goal) => goal.id === selectedId) ?? goals[0];

  useEffect(() => {
    if (!selectedId && goals[0]) {
      setSelectedId(goals[0].id);
    }
  }, [goals, selectedId]);

  return (
    <SectionShell
      description="Tambah progres target tabungan. Secara default ini tidak mengurangi saldo dompet kecuali Anda mengaktifkannya."
      icon={Target}
      title="Tambah Tabungan Target"
    >
      {isLoading ? <InlineState message="Memuat target aktif..." /> : null}
      {!isLoading && goals.length === 0 ? (
        <InlineState actionHref="/app/goals/new" actionLabel="Tambah Target" message="Belum ada target tabungan aktif." />
      ) : null}
      {!isLoading && selectedGoal ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goalId">Pilih target</Label>
            <select
              className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-base text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="goalId"
              onChange={(event) => setSelectedId(event.target.value)}
              value={selectedGoal.id}
            >
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.name} - kurang {moneyFormatter.format(Math.max(goal.remaining_amount, 0))}
                </option>
              ))}
            </select>
          </div>
          <GoalRecordForm
            defaultAmount={Math.max(selectedGoal.remaining_amount, 0)}
            defaultWalletId={selectedGoal.wallet_id ?? wallets[0]?.id ?? ''}
            isSubmitting={isSubmitting}
            onSubmit={(input) => onSubmit(selectedGoal, input)}
            wallets={wallets}
          />
        </div>
      ) : null}
    </SectionShell>
  );
}

function GoalRecordForm({
  defaultAmount,
  defaultWalletId,
  isSubmitting,
  onSubmit,
  wallets
}: {
  defaultAmount: number;
  defaultWalletId: string;
  isSubmitting: boolean;
  onSubmit: (input: GoalRecordInput) => Promise<void>;
  wallets: Array<{ id: string; name: string; wallet_type: string }>;
}) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset
  } = useForm<GoalRecordInput>({
    defaultValues: {
      amount: defaultAmount,
      contributionDate: today(),
      note: '',
      reduceWallet: false,
      walletId: defaultWalletId
    },
    resolver: zodResolver(goalRecordSchema)
  });

  useEffect(() => {
    reset({
      amount: defaultAmount,
      contributionDate: today(),
      note: '',
      reduceWallet: false,
      walletId: defaultWalletId
    });
  }, [defaultAmount, defaultWalletId, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="goal-amount">Nominal tabungan</Label>
          <Input id="goal-amount" min="0.01" step="0.01" type="number" {...register('amount', { valueAsNumber: true })} />
          {errors.amount ? <p className="text-sm text-destructive">{errors.amount.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="goal-date">Tanggal</Label>
          <Input id="goal-date" type="date" {...register('contributionDate')} />
          {errors.contributionDate ? <p className="text-sm text-destructive">{errors.contributionDate.message}</p> : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="goal-wallet">Dompet sumber</Label>
        <select
          className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-base text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          id="goal-wallet"
          {...register('walletId')}
        >
          <option value="">Tanpa dompet</option>
          {wallets.map((wallet) => (
            <option key={wallet.id} value={wallet.id}>
              {wallet.name}
            </option>
          ))}
        </select>
        {errors.walletId ? <p className="text-sm text-destructive">{errors.walletId.message}</p> : null}
      </div>
      <label className="flex items-start gap-3 rounded-2xl border border-border bg-muted/40 p-3 text-sm">
        <input className="mt-1" type="checkbox" {...register('reduceWallet')} />
        <span>
          <span className="block font-medium text-foreground">Kurangi saldo dompet</span>
          <span className="text-muted-foreground">Matikan jika hanya ingin mencatat progres target tanpa mengubah saldo.</span>
        </span>
      </label>
      <div className="space-y-2">
        <Label htmlFor="goal-note">Catatan</Label>
        <Input id="goal-note" placeholder="Opsional" {...register('note')} />
      </div>
      <Button className="w-full rounded-2xl" disabled={isSubmitting} type="submit">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Tambah Tabungan
      </Button>
    </form>
  );
}

function RecurringRecordSection({
  categories,
  isLoading,
  isSubmitting,
  onSubmit,
  recurringItems,
  wallets
}: {
  categories: TransactionReferenceCategory[];
  isLoading: boolean;
  isSubmitting: boolean;
  onSubmit: (item: RecurringTransaction, input: RecurringRunInput) => Promise<void>;
  recurringItems: RecurringTransaction[];
  wallets: TransactionReferenceWallet[];
}) {
  const [selectedId, setSelectedId] = useState('');
  const selectedItem = recurringItems.find((item) => item.id === selectedId) ?? recurringItems[0];

  useEffect(() => {
    if (!selectedId && recurringItems[0]) {
      setSelectedId(recurringItems[0].id);
    }
  }, [recurringItems, selectedId]);

  return (
    <SectionShell
      description="Pilih template rutin, sesuaikan tanggal atau nominal jika perlu, lalu Vinari akan membuat catatan uang."
      icon={CalendarClock}
      title="Catat Transaksi Rutin"
    >
      {isLoading ? <InlineState message="Memuat transaksi rutin..." /> : null}
      {!isLoading && recurringItems.length === 0 ? (
        <InlineState
          actionHref="/app/recurring/new"
          actionLabel="Tambah Rutin"
          message="Belum ada transaksi rutin aktif."
        />
      ) : null}
      {!isLoading && selectedItem ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recurringId">Pilih transaksi rutin</Label>
            <select
              className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-base text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              id="recurringId"
              onChange={(event) => setSelectedId(event.target.value)}
              value={selectedItem.id}
            >
              {recurringItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} - {moneyFormatter.format(item.amount)}
                </option>
              ))}
            </select>
          </div>
          <RecurringRunForm
            categories={categories.filter((category) => category.type === selectedItem.type)}
            defaultAmount={selectedItem.amount}
            defaultCategoryId={selectedItem.category_id ?? ''}
            defaultNote={selectedItem.note ?? ''}
            defaultWalletId={selectedItem.wallet_id ?? wallets[0]?.id ?? ''}
            isSubmitting={isSubmitting}
            onSubmit={(input) => onSubmit(selectedItem, input)}
            type={selectedItem.type}
            wallets={wallets}
          />
        </div>
      ) : null}
    </SectionShell>
  );
}

function RecurringRunForm({
  categories,
  defaultAmount,
  defaultCategoryId,
  defaultNote,
  defaultWalletId,
  isSubmitting,
  onSubmit,
  type,
  wallets
}: {
  categories: TransactionReferenceCategory[];
  defaultAmount: number;
  defaultCategoryId: string;
  defaultNote: string;
  defaultWalletId: string;
  isSubmitting: boolean;
  onSubmit: (input: RecurringRunInput) => Promise<void>;
  type: 'income' | 'expense';
  wallets: TransactionReferenceWallet[];
}) {
  const fallbackCategory = defaultCategoryId || categories[0]?.id || '';
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset
  } = useForm<RecurringRunInput>({
    defaultValues: {
      amount: defaultAmount,
      categoryId: fallbackCategory,
      note: defaultNote,
      transactionDate: today(),
      walletId: defaultWalletId
    },
    resolver: zodResolver(recurringRunSchema)
  });

  useEffect(() => {
    reset({
      amount: defaultAmount,
      categoryId: fallbackCategory,
      note: defaultNote,
      transactionDate: today(),
      walletId: defaultWalletId
    });
  }, [defaultAmount, defaultNote, defaultWalletId, fallbackCategory, reset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="rounded-2xl bg-muted/50 p-3 text-sm text-muted-foreground">
        Transaksi ini akan dicatat sebagai <span className="font-semibold text-foreground">{type === 'income' ? 'uang masuk' : 'uang keluar'}</span>.
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="recurring-amount">Nominal</Label>
          <Input id="recurring-amount" min="0.01" step="0.01" type="number" {...register('amount', { valueAsNumber: true })} />
          {errors.amount ? <p className="text-sm text-destructive">{errors.amount.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="recurring-date">Tanggal</Label>
          <Input id="recurring-date" type="date" {...register('transactionDate')} />
          {errors.transactionDate ? <p className="text-sm text-destructive">{errors.transactionDate.message}</p> : null}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="recurring-wallet">Dompet</Label>
          <select
            className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-base text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="recurring-wallet"
            {...register('walletId')}
          >
            <option value="">Pilih dompet</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </select>
          {errors.walletId ? <p className="text-sm text-destructive">{errors.walletId.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="recurring-category">Kategori</Label>
          <select
            className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-base text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="recurring-category"
            {...register('categoryId')}
          >
            <option value="">Pilih kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? <p className="text-sm text-destructive">{errors.categoryId.message}</p> : null}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="recurring-note">Catatan</Label>
        <Input id="recurring-note" placeholder="Opsional" {...register('note')} />
      </div>
      <Button className="w-full rounded-2xl" disabled={isSubmitting} type="submit">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Catat Sekarang
      </Button>
    </form>
  );
}
