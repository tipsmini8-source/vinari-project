import { ArrowRightLeft, ReceiptText } from 'lucide-react';
import { Link } from 'react-router';

import type { DashboardTransaction } from '@features/dashboard/types/dashboard.types';
import { Button } from '@shared/ui/button';

type RecentTransactionsProps = {
  transactions: DashboardTransaction[];
};

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  style: 'currency',
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium'
});

function getAmountClass(type: DashboardTransaction['type']) {
  if (type === 'income') {
    return 'text-success';
  }

  if (type === 'expense') {
    return 'text-destructive';
  }

  return 'text-foreground';
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
        <ReceiptText className="mx-auto size-10 text-muted-foreground" />
        <h2 className="mt-4 font-semibold">Belum ada catatan uang</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          Catat uang masuk, uang keluar, atau pindah saldo pertama agar ringkasan mulai terisi.
        </p>
        <Button asChild className="mt-5 rounded-xl">
          <Link to="/app/transactions/new">Catat Uang</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <div>
          <h2 className="font-semibold">Transaksi Terbaru</h2>
          <p className="text-sm text-muted-foreground">Maksimal 5 transaksi terakhir.</p>
        </div>
        <Button asChild className="rounded-xl" size="sm" variant="outline">
          <Link to="/app/transactions">Lihat semua</Link>
        </Button>
      </div>
      <div className="divide-y divide-border">
        {transactions.map((transaction) => (
          <Link
            className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-accent hover:text-accent-foreground"
            key={transaction.id}
            to={`/app/transactions/${transaction.id}`}
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <ArrowRightLeft className="size-4" />
              </span>
              <div>
                <p className="font-medium">{transaction.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {dateFormatter.format(new Date(transaction.transaction_date))} {'\u2022'}{' '}
                  {transaction.type === 'transfer'
                    ? `${transaction.wallet_name ?? '-'} ke ${transaction.destination_wallet_name ?? '-'}`
                    : `${transaction.wallet_name ?? '-'} \u2022 ${transaction.category_name ?? '-'}`}
                </p>
              </div>
            </div>
            <p className={`text-sm font-semibold ${getAmountClass(transaction.type)}`}>
              {moneyFormatter.format(transaction.amount)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
