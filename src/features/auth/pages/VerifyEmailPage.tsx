import { MailCheck } from 'lucide-react';
import { Link } from 'react-router';

import { AuthFormCard } from '@features/auth/components/AuthFormCard';
import { Button } from '@shared/ui/button';

export function VerifyEmailPage() {
  return (
    <AuthFormCard
      description="Silakan cek email Anda untuk melakukan verifikasi akun."
      footer={
        <Button asChild className="w-full">
          <Link to="/login">Ke halaman login</Link>
        </Button>
      }
      title="Verifikasi email"
    >
      <div className="flex items-start gap-3 rounded-md border border-border bg-secondary/40 p-4">
        <MailCheck className="mt-0.5 size-5 text-primary" />
        <p className="text-sm leading-6 text-muted-foreground">
          Jika akun sudah diverifikasi, Anda dapat login menggunakan email dan password yang terdaftar.
        </p>
      </div>
    </AuthFormCard>
  );
}
