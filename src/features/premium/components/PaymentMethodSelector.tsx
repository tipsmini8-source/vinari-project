import { CheckCircle2, QrCode } from 'lucide-react';

import type { PaymentMethod } from '@features/premium/types/premium.types';
import { cn } from '@shared/lib/utils';

type PaymentMethodSelectorProps = {
  methods: PaymentMethod[];
  onSelect: (method: PaymentMethod) => void;
  selectedMethodId: string | null;
};

const methodLabels: Record<string, string> = {
  bank_transfer: 'Bank Transfer',
  ewallet: 'E-Wallet',
  manual: 'Manual',
  qris: 'QRIS'
};

export function PaymentMethodSelector({ methods, onSelect, selectedMethodId }: PaymentMethodSelectorProps) {
  if (methods.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-card p-5 text-card-foreground">
        <h2 className="font-semibold">Metode pembayaran belum tersedia</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Admin perlu menambahkan QRIS atau metode pembayaran manual terlebih dahulu.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-md border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <QrCode className="mt-0.5 size-5 text-primary" />
        <div>
          <h2 className="font-semibold">Pilih metode pembayaran</h2>
          <p className="mt-1 text-sm text-muted-foreground">Metode yang dipilih akan tersimpan di payment request.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {methods.map((method) => {
          const isSelected = selectedMethodId === method.id;

          return (
            <button
              className={cn(
                'rounded-md border border-border bg-background p-4 text-left transition-colors',
                isSelected && 'border-primary ring-1 ring-primary'
              )}
              key={method.id}
              onClick={() => onSelect(method)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{method.name}</p>
                  <p className="mt-1 text-xs font-medium uppercase text-muted-foreground">
                    {methodLabels[method.method_type] ?? method.method_type}
                  </p>
                </div>
                {isSelected ? <CheckCircle2 className="size-5 text-primary" /> : null}
              </div>

              {method.method_type === 'qris' && method.qr_image_public_url ? (
                <img
                  alt={`QRIS ${method.name}`}
                  className="mt-4 max-h-72 w-full rounded-md border border-border object-contain"
                  src={method.qr_image_public_url}
                />
              ) : null}

              <div className="mt-4 grid gap-1 text-sm text-muted-foreground">
                {method.account_name ? <p>Atas nama: {method.account_name}</p> : null}
                {method.bank_name ? <p>Bank: {method.bank_name}</p> : null}
                {method.account_number ? <p>Nomor: {method.account_number}</p> : null}
                {method.instructions ? <p className="pt-2 text-foreground">{method.instructions}</p> : null}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
