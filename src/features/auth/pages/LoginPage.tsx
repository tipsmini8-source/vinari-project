import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { AuthFormCard } from '@features/auth/components/AuthFormCard';
import { FormTextField } from '@features/auth/components/FormTextField';
import { useAuth } from '@features/auth/hooks/useAuth';
import { loginSchema } from '@features/auth/schemas/auth.schemas';
import type { LoginInput } from '@features/auth/types/auth.types';
import { Button } from '@shared/ui/button';
import { useToast } from '@shared/ui/use-toast';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values);
      toast({ title: 'Berhasil masuk', description: 'Selamat datang kembali di Vinari.' });
      void navigate('/app', { replace: true });
    } catch (error) {
      toast({
        title: 'Login gagal',
        description: error instanceof Error ? error.message : 'Periksa email dan password Anda.',
        variant: 'destructive'
      });
    }
  });

  return (
    <AuthFormCard
      description="Masuk untuk melanjutkan ke ruang keuangan Vinari."
      footer={
        <>
          Belum punya akun?{' '}
          <Link className="font-medium text-primary hover:underline" to="/register">
            Daftar
          </Link>
        </>
      }
      title="Masuk"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <FormTextField
          error={errors.email}
          label="Email"
          placeholder="nama@email.com"
          registration={register('email')}
          type="email"
        />
        <FormTextField
          error={errors.password}
          label="Password"
          placeholder="Password akun"
          registration={register('password')}
          type="password"
        />
        <div className="flex justify-end">
          <Link className="text-sm font-medium text-primary hover:underline" to="/forgot-password">
            Lupa password?
          </Link>
        </div>
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Masuk
        </Button>
      </form>
    </AuthFormCard>
  );
}
