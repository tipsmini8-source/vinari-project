import { FileText, ImageIcon, X } from 'lucide-react';

import type { AdminPaymentProofPreview } from '@features/admin/types/admin.types';
import { Button } from '@shared/ui/button';

type AdminProofPreviewDialogProps = {
  isLoading: boolean;
  onClose: () => void;
  preview: AdminPaymentProofPreview | null;
};

export function AdminProofPreviewDialog({ isLoading, onClose, preview }: AdminProofPreviewDialogProps) {
  if (!isLoading && !preview) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-md border border-border bg-card p-4 text-card-foreground shadow-lg">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {preview?.isImage ? <ImageIcon className="size-5 text-primary" /> : <FileText className="size-5 text-primary" />}
            <h2 className="font-semibold">Bukti Pembayaran</h2>
          </div>
          <Button aria-label="Tutup preview" onClick={onClose} size="icon" type="button" variant="ghost">
            <X className="size-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="h-64 animate-pulse rounded-md bg-secondary" />
        ) : null}

        {preview?.isImage ? (
          <img
            alt="Bukti pembayaran"
            className="max-h-[70vh] w-full rounded-md border border-border object-contain"
            src={preview.signedUrl}
          />
        ) : null}

        {preview && !preview.isImage ? (
          <Button asChild variant="outline">
            <a href={preview.signedUrl} rel="noreferrer" target="_blank">
              <FileText className="size-4" />
              Buka {preview.fileName}
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
