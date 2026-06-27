import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router';

import { useWorkspace } from '@/core/workspace';
import { useAuth } from '@features/auth';
import { FormTextField } from '@features/auth/components/FormTextField';
import { useCreateOnboarding } from '@features/onboarding/hooks/useOnboarding';
import { onboardingSchema } from '@features/onboarding/schemas/onboarding.schemas';
import type { OnboardingInput, UsageType } from '@features/onboarding/types/onboarding.types';
import { OnboardingShell } from '@features/onboarding/components/OnboardingShell';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { useToast } from '@shared/ui/use-toast';
import { GlobalLoading } from '@shared/ui/global-loading';
import { cn } from '@shared/lib/utils';

const totalSteps = 5;

const usageOptions: Array<{ value: UsageType; label: string; description: string }> = [
  {
    value: 'personal',
    label: 'Personal',
    description: 'Untuk mengelola keuangan pribadi.'
  },
  {
    value: 'couple',
    label: 'Couple',
    description: 'Untuk pasangan yang ingin berbagi visibilitas keuangan.'
  },
  {
    value: 'family',
    label: 'Family',
    description: 'Untuk keluarga dengan kebutuhan kolaborasi lebih luas.'
  }
];

const walletTypes = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
  { value: 'ewallet', label: 'E-Wallet' },
  { value: 'saving', label: 'Saving' },
  { value: 'investment', label: 'Investment' },
  { value: 'other', label: 'Other' }
];

const stepCopy = [
  {
    title: 'Selamat datang di Vinari',
    description: 'Mari siapkan workspace, kategori, dan wallet pertama Anda dalam beberapa langkah.'
  },
  {
    title: 'Pilih tipe penggunaan',
    description: 'Pilihan ini membantu Vinari menyiapkan konteks workspace awal.'
  },
  {
    title: 'Buat workspace',
    description: 'Workspace adalah ruang utama untuk data keuangan Anda.'
  },
  {
    title: 'Buat wallet pertama',
    description: 'Wallet pertama menjadi titik awal pencatatan saldo dan transaksi nanti.'
  },
  {
    title: 'Selesai',
    description: 'Periksa ringkasan awal sebelum Vinari membuat data workspace Anda.'
  }
];

const fieldsByStep: Record<number, Array<keyof OnboardingInput>> = {
  1: [],
  2: ['usageType'],
  3: ['workspaceName', 'currencyCode'],
  4: ['walletName', 'walletType', 'initialBalance'],
  5: []
};

export function OnboardingPage() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { loading: workspaceLoading, refreshWorkspace, workspace } = useWorkspace();
  const createOnboarding = useCreateOnboarding(user?.id);
  const {
    formState: { errors },
    control,
    getValues,
    handleSubmit,
    register,
    setValue,
    trigger
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      usageType: 'personal',
      workspaceName: '',
      currencyCode: 'IDR',
      walletName: '',
      walletType: 'bank',
      initialBalance: 0
    }
  });

  const selectedUsageType = useWatch({ control, name: 'usageType' });
  const copy = stepCopy[step - 1];

  useEffect(() => {
    if (workspace) {
      void navigate('/app', { replace: true });
    }
  }, [navigate, workspace]);

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (workspaceLoading) {
    return <GlobalLoading />;
  }

  const goNext = async () => {
    const valid = await trigger(fieldsByStep[step]);

    if (valid) {
      setStep((current) => Math.min(current + 1, totalSteps));
    }
  };

  const goBack = () => {
    setStep((current) => Math.max(current - 1, 1));
  };

  const onSubmit = handleSubmit(async (input) => {
    try {
      await createOnboarding.mutateAsync(input);
      await refreshWorkspace();
      toast({
        title: 'Onboarding selesai',
        description: 'Workspace, wallet, dan kategori default sudah dibuat.'
      });
      void navigate('/app', { replace: true });
    } catch (error) {
      toast({
        title: 'Onboarding gagal',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  });

  return (
    <OnboardingShell
      currentStep={step}
      description={copy.description}
      title={copy.title}
      totalSteps={totalSteps}
    >
      <form className="space-y-6" onSubmit={onSubmit}>
        {step === 1 ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-md border border-border bg-secondary/40 p-4">
              <CheckCircle2 className="mt-0.5 size-5 text-primary" />
              <p className="text-sm leading-6 text-muted-foreground">
                Setup ini hanya membuat data awal: workspace, membership owner, wallet pertama, dan
                kategori default Indonesia.
              </p>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-3">
            {usageOptions.map((option) => (
              <button
                className={cn(
                  'rounded-md border border-border p-4 text-left transition-colors hover:bg-accent hover:text-accent-foreground',
                  selectedUsageType === option.value && 'border-primary bg-accent text-accent-foreground'
                )}
                key={option.value}
                onClick={() => setValue('usageType', option.value, { shouldValidate: true })}
                type="button"
              >
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{option.description}</span>
              </button>
            ))}
            {errors.usageType ? <p className="text-sm text-destructive">{errors.usageType.message}</p> : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <FormTextField
              error={errors.workspaceName}
              label="Nama workspace"
              placeholder="Keuangan Keluarga"
              registration={register('workspaceName')}
            />
            <FormTextField
              error={errors.currencyCode}
              label="Currency default"
              placeholder="IDR"
              registration={register('currencyCode')}
            />
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-4">
            <FormTextField
              error={errors.walletName}
              label="Nama wallet"
              placeholder="Rekening Utama"
              registration={register('walletName')}
            />
            <div className="space-y-2">
              <Label htmlFor="walletType">Tipe wallet</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                id="walletType"
                {...register('walletType')}
              >
                {walletTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.walletType ? <p className="text-sm text-destructive">{errors.walletType.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="initialBalance">Saldo awal</Label>
              <Input
                id="initialBalance"
                min="0"
                step="0.01"
                type="number"
                {...register('initialBalance', { valueAsNumber: true })}
              />
              {errors.initialBalance ? (
                <p className="text-sm text-destructive">{errors.initialBalance.message}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="space-y-3 rounded-md border border-border bg-secondary/30 p-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Tipe penggunaan</span>
              <span className="font-medium capitalize">{getValues('usageType')}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Workspace</span>
              <span className="font-medium">{getValues('workspaceName')}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Currency</span>
              <span className="font-medium">{getValues('currencyCode')}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Wallet</span>
              <span className="font-medium">{getValues('walletName')}</span>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button disabled={step === 1 || createOnboarding.isPending} onClick={goBack} type="button" variant="outline">
            Kembali
          </Button>
          {step < totalSteps ? (
            <Button onClick={goNext} type="button">
              Lanjut
            </Button>
          ) : (
            <Button disabled={createOnboarding.isPending} type="submit">
              {createOnboarding.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Selesaikan
            </Button>
          )}
        </div>
      </form>
    </OnboardingShell>
  );
}
