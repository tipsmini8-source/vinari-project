import { Edit, Power, Trash2 } from 'lucide-react';

import type { AdminPaymentMethod } from '@features/admin/types/admin.types';
import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';

type AdminPaymentMethodListProps = {
  isMutating: boolean;
  methods: AdminPaymentMethod[];
  onDelete: (method: AdminPaymentMethod) => void;
  onEdit: (method: AdminPaymentMethod) => void;
  onToggle: (method: AdminPaymentMethod) => void;
};

const methodLabels: Record<string, string> = {
  bank_transfer: 'Bank Transfer',
  ewallet: 'E-Wallet',
  manual: 'Manual',
  qris: 'QRIS'
};

export function AdminPaymentMethodList({
  isMutating,
  methods,
  onDelete,
  onEdit,
  onToggle
}: AdminPaymentMethodListProps) {
  return (
    <div className="grid gap-3">
      {methods.map((method) => (
        <article className="rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm" key={method.id}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{method.name}</h2>
                <span className="rounded-sm bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">
                  {methodLabels[method.method_type] ?? method.method_type}
                </span>
                <span
                  className={cn(
                    'rounded-sm px-2 py-0.5 text-xs font-medium',
                    method.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {method.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>

              <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <p>Atas nama: {method.account_name ?? '-'}</p>
                <p>Nomor: {method.account_number ?? '-'}</p>
                <p>Bank: {method.bank_name ?? '-'}</p>
                <p>Sort order: {method.sort_order}</p>
              </div>

              {method.instructions ? <p className="mt-3 text-sm">{method.instructions}</p> : null}

              {method.qr_image_public_url ? (
                <img
                  alt={`QRIS ${method.name}`}
                  className="mt-4 max-h-64 rounded-md border border-border object-contain"
                  src={method.qr_image_public_url}
                />
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Button disabled={isMutating} onClick={() => onEdit(method)} type="button" variant="outline">
                <Edit className="size-4" />
                Edit
              </Button>
              <Button disabled={isMutating} onClick={() => onToggle(method)} type="button" variant="outline">
                <Power className="size-4" />
                {method.is_active ? 'Nonaktifkan' : 'Aktifkan'}
              </Button>
              <Button disabled={isMutating} onClick={() => onDelete(method)} type="button" variant="ghost">
                <Trash2 className="size-4" />
                Hapus
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
