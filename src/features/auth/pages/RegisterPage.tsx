import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';

import { AuthFormCard } from '@features/auth/components/AuthFormCard';
import { FormTextField } from '@features/auth/components/FormTextField';
import { useAuth } from '@features/auth/hooks/useAuth';
import { registerSchema } from '@features/auth/schemas/auth.schemas';
import type { RegisterInput } from '@features/auth/types/auth.types';
import { Button } from '@shared/ui/button';
import { useToast } from '@shared/ui/use-toast';

export function RegisterPage() {
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const { toast } = useToast();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const session = await registerUser(values);

      if (session) {
        toast({
          title: 'Registrasi berhasil',
          description: 'Akun siap digunakan. Mari lanjut siapkan ruang keuangan.'
        });
        void navigate('/app', { replace: true });
        return;
      }

      setRegistered(true);
      toast({
        title: 'Registrasi berhasil',
        description: 'Silakan cek email Anda untuk melakukan verifikasi akun.'
      });
    } catch (error) {
      toast({
        title: 'Registrasi gagal',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  });

  if (registered) {
    return (
      <AuthFormCard
        description="Silakan cek email Anda untuk melakukan verifikasi akun."
        footer={
          <Link className="font-medium text-primary hover:underline" to="/login">
            Kembali ke login
          </Link>
        }
        title="Verifikasi email"
      >
        <div className="flex items-start gap-3 rounded-md border border-border bg-secondary/40 p-4">
          <CheckCircle2 className="mt-0.5 size-5 text-primary" />
          <p className="text-sm leading-6 text-muted-foreground">
            Kami sudah mengirim tautan verifikasi. Setelah email terverifikasi, Anda bisa login ke
            Vinari.
          </p>
        </div>
      </AuthFormCard>
    );
  }

  return (
    <AuthFormCard
      description="Buat akun Vinari untuk mulai mengelola keuangan personal atau keluarga."
      footer={
        <>
          Sudah punya akun?{' '}
          <Link className="font-medium text-primary hover:underline" to="/login">
            Masuk
          </Link>
        </>
      }
      title="Daftar"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <FormTextField
          error={errors.fullName}
          label="Nama Lengkap"
          placeholder="Nama lengkap"
          registration={register('fullName')}
        />
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
          placeholder="Minimal 8 karakter"
          registration={register('password')}
          type="password"
        />
        <FormTextField
          error={errors.confirmPassword}
          label="Konfirmasi Password"
          placeholder="Ulangi password"
          registration={register('confirmPassword')}
          type="password"
        />
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Daftar
        </Button>
      </form>
    </AuthFormCard>
  );
}
