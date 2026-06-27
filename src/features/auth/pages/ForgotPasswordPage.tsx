import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';

import { AuthFormCard } from '@features/auth/components/AuthFormCard';
import { FormTextField } from '@features/auth/components/FormTextField';
import { useAuth } from '@features/auth/hooks/useAuth';
import { forgotPasswordSchema } from '@features/auth/schemas/auth.schemas';
import type { ForgotPasswordInput } from '@features/auth/types/auth.types';
import { Button } from '@shared/ui/button';
import { useToast } from '@shared/ui/use-toast';

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const { toast } = useToast();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await forgotPassword(values);
      toast({
        title: 'Email reset terkirim',
        description: 'Periksa email Anda untuk melanjutkan reset password.'
      });
    } catch (error) {
      toast({
        title: 'Gagal mengirim email',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  });

  return (
    <AuthFormCard
      description="Masukkan email akun Anda untuk menerima tautan reset password."
      footer={
        <Link className="font-medium text-primary hover:underline" to="/login">
          Kembali ke login
        </Link>
      }
      title="Lupa password"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <FormTextField
          error={errors.email}
          label="Email"
          placeholder="nama@email.com"
          registration={register('email')}
          type="email"
        />
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Kirim tautan reset
        </Button>
      </form>
    </AuthFormCard>
  );
}
