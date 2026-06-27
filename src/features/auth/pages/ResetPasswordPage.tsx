import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';

import { AuthFormCard } from '@features/auth/components/AuthFormCard';
import { FormTextField } from '@features/auth/components/FormTextField';
import { useAuth } from '@features/auth/hooks/useAuth';
import { resetPasswordSchema } from '@features/auth/schemas/auth.schemas';
import type { ResetPasswordInput } from '@features/auth/types/auth.types';
import { Button } from '@shared/ui/button';
import { useToast } from '@shared/ui/use-toast';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await resetPassword(values);
      toast({
        title: 'Password diperbarui',
        description: 'Silakan login menggunakan password baru.'
      });
      void navigate('/login', { replace: true });
    } catch (error) {
      toast({
        title: 'Reset password gagal',
        description: error instanceof Error ? error.message : 'Tautan reset mungkin sudah kedaluwarsa.',
        variant: 'destructive'
      });
    }
  });

  return (
    <AuthFormCard
      description="Buat password baru untuk akun Vinari Anda."
      footer={
        <Link className="font-medium text-primary hover:underline" to="/login">
          Kembali ke login
        </Link>
      }
      title="Reset password"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <FormTextField
          error={errors.password}
          label="Password baru"
          placeholder="Minimal 8 karakter"
          registration={register('password')}
          type="password"
        />
        <FormTextField
          error={errors.confirmPassword}
          label="Konfirmasi Password"
          placeholder="Ulangi password baru"
          registration={register('confirmPassword')}
          type="password"
        />
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Simpan password baru
        </Button>
      </form>
    </AuthFormCard>
  );
}
