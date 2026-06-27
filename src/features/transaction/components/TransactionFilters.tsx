import type {
  TransactionFilterInput,
  TransactionReferenceCategory,
  TransactionReferenceWallet
} from '@features/transaction/types/transaction.types';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';

type TransactionFiltersProps = {
  categories: TransactionReferenceCategory[];
  filters: TransactionFilterInput;
  onChange: (filters: TransactionFilterInput) => void;
  wallets: TransactionReferenceWallet[];
};

export function TransactionFilters({ categories, filters, onChange, wallets }: TransactionFiltersProps) {
  return (
    <div className="grid gap-3 rounded-md border border-border bg-card p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
      <div className="space-y-2">
        <Label htmlFor="dateFrom">Dari</Label>
        <Input
          id="dateFrom"
          onChange={(event) => onChange({ ...filters, dateFrom: event.target.value })}
          type="date"
          value={filters.dateFrom ?? ''}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateTo">Sampai</Label>
        <Input
          id="dateTo"
          onChange={(event) => onChange({ ...filters, dateTo: event.target.value })}
          type="date"
          value={filters.dateTo ?? ''}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="filterType">Tipe</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          id="filterType"
          onChange={(event) =>
            onChange({ ...filters, type: event.target.value as TransactionFilterInput['type'] })
          }
          value={filters.type}
        >
          <option value="all">Semua</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="transfer">Transfer</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="filterWallet">Wallet</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          id="filterWallet"
          onChange={(event) => onChange({ ...filters, walletId: event.target.value })}
          value={filters.walletId ?? ''}
        >
          <option value="">Semua wallet</option>
          {wallets.map((wallet) => (
            <option key={wallet.id} value={wallet.id}>
              {wallet.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="filterCategory">Kategori</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          id="filterCategory"
          onChange={(event) => onChange({ ...filters, categoryId: event.target.value })}
          value={filters.categoryId ?? ''}
        >
          <option value="">Semua kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2 lg:col-span-5">
        <Button
          onClick={() => onChange({ type: 'all', dateFrom: '', dateTo: '', walletId: '', categoryId: '' })}
          type="button"
          variant="outline"
        >
          Reset filter
        </Button>
      </div>
    </div>
  );
}
