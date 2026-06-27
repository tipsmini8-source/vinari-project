import { ArrowRightLeft, Edit, Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router';

import type { Transaction } from '@features/transaction/types/transaction.types';
import { Button } from '@shared/ui/button';

type TransactionListProps = {
  onDelete: (transaction: Transaction) => void;
  transactions: Transaction[];
};

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  style: 'currency',
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium'
});

function getAmountClass(type: Transaction['type']) {
  if (type === 'income') {
    return 'text-primary';
  }

  if (type === 'expense') {
    return 'text-destructive';
  }

  return 'text-foreground';
}

export function TransactionList({ onDelete, transactions }: TransactionListProps) {
  return (
    <div className="grid gap-3">
      {transactions.map((transaction) => (
        <article className="rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm" key={transaction.id}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <ArrowRightLeft className="size-5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{transaction.title}</h2>
                  <span className="rounded-sm bg-secondary px-2 py-0.5 text-xs capitalize text-muted-foreground">
                    {transaction.type}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {dateFormatter.format(new Date(transaction.transaction_date))} -{' '}
                  {transaction.type === 'transfer'
                    ? `${transaction.wallet_name ?? '-'} ke ${transaction.destination_wallet_name ?? '-'}`
                    : `${transaction.wallet_name ?? '-'} - ${transaction.category_name ?? '-'}`}
                </p>
                {transaction.note ? (
                  <p className="mt-2 text-sm text-muted-foreground">{transaction.note}</p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
              <p className={`font-semibold ${getAmountClass(transaction.type)}`}>
                {moneyFormatter.format(transaction.amount)}
              </p>
              <div className="flex gap-1">
                <Button asChild aria-label="Detail transaksi" size="icon" variant="ghost">
                  <Link to={`/app/transactions/${transaction.id}`}>
                    <Eye className="size-4" />
                  </Link>
                </Button>
                <Button asChild aria-label="Edit transaksi" size="icon" variant="ghost">
                  <Link to={`/app/transactions/${transaction.id}/edit`}>
                    <Edit className="size-4" />
                  </Link>
                </Button>
                <Button
                  aria-label="Hapus transaksi"
                  onClick={() => onDelete(transaction)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
