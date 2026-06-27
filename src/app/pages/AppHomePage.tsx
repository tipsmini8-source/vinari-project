import { LogOut, ReceiptText, WalletCards } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

import { useAuth } from '@features/auth';
import { Button } from '@shared/ui/button';
import { useToast } from '@shared/ui/use-toast';

export function AppHomePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: 'Berhasil logout' });
      void navigate('/login', { replace: true });
    } catch (error) {
      toast({
        title: 'Logout gagal',
        description: error instanceof Error ? error.message : 'Silakan coba lagi.',
        variant: 'destructive'
      });
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100svh-6rem)] w-full max-w-3xl items-center justify-center px-4">
      <div className="w-full rounded-md border border-border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm font-medium text-primary">Vinari</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal">Dashboard sedang disiapkan</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Data awal sudah siap. Area dashboard penuh akan dibangun pada tahap berikutnya.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/app/wallets">
              <WalletCards className="size-4" />
              Kelola Wallet
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/app/transactions">
              <ReceiptText className="size-4" />
              Kelola Transaksi
            </Link>
          </Button>
          <Button onClick={handleLogout} type="button" variant="outline">
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </div>
    </section>
  );
}
