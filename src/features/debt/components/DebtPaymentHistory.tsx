import { CalendarDays } from 'lucide-react';

import type { DebtPayment } from '@features/debt/types/debt.types';

type DebtPaymentHistoryProps = {
  payments: DebtPayment[];
};

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  style: 'currency',
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium'
});

export function DebtPaymentHistory({ payments }: DebtPaymentHistoryProps) {
  if (payments.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border p-6 text-center">
        <CalendarDays className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">Belum ada pembayaran untuk hutang ini.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {payments.map((payment) => (
        <article className="rounded-md border border-border p-4" key={payment.id}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">{moneyFormatter.format(payment.amount)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {dateFormatter.format(new Date(payment.payment_date))}
                {payment.wallet_name ? ` - ${payment.wallet_name}` : ''}
              </p>
              {payment.note ? <p className="mt-2 text-sm text-muted-foreground">{payment.note}</p> : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
