import type {
  ReportCategoryBreakdown,
  ReportWalletSummary
} from '@features/report/types/report.types';

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  currency: 'IDR',
  style: 'currency',
  maximumFractionDigits: 0
});

export function CategoryBreakdownTable({
  emptyLabel,
  items,
  title
}: {
  emptyLabel: string;
  items: ReportCategoryBreakdown[];
  title: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card text-card-foreground shadow-sm">
      <div className="border-b border-border p-4">
        <h2 className="font-semibold">{title}</h2>
      </div>
      {items.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">Kategori</th>
                <th className="p-4 text-right font-medium">Total</th>
                <th className="p-4 text-right font-medium">Persentase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.category_id ?? item.category_name}>
                  <td className="p-4 font-medium">{item.category_name}</td>
                  <td className="p-4 text-right">{moneyFormatter.format(item.total)}</td>
                  <td className="p-4 text-right">{item.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function WalletSummaryTable({ wallets }: { wallets: ReportWalletSummary[] }) {
  return (
    <div className="rounded-md border border-border bg-card text-card-foreground shadow-sm">
      <div className="border-b border-border p-4">
        <h2 className="font-semibold">Ringkasan Dompet</h2>
      </div>
      {wallets.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">Belum ada dompet aktif.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">Dompet</th>
                <th className="p-4 text-right font-medium">Saldo saat ini</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {wallets.map((wallet) => (
                <tr key={wallet.id}>
                  <td className="p-4 font-medium">{wallet.name}</td>
                  <td className="p-4 text-right">{moneyFormatter.format(wallet.current_balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
