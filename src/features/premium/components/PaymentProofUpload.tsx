import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, ImageIcon, Loader2, Upload } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import {
  paymentProofSchema,
  type PaymentProofFormInput
} from '@features/premium/schemas/payment-proof.schemas';
import type { PaymentProofPreview } from '@features/premium/types/premium.types';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';

type PaymentProofUploadFormProps = {
  isUploading: boolean;
  onSubmit: (file: File) => Promise<void>;
};

type PaymentProofPreviewPanelProps = {
  preview: PaymentProofPreview | null;
};

export function PaymentProofUploadForm({ isUploading, onSubmit }: PaymentProofUploadFormProps) {
  const {
    formState: { errors, isSubmitSuccessful },
    handleSubmit,
    register,
    reset
  } = useForm<PaymentProofFormInput>({
    resolver: zodResolver(paymentProofSchema)
  });

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  const handleValidSubmit = async (input: PaymentProofFormInput) => {
    const file = input.proofFile.item(0);

    if (!file) {
      return;
    }

    await onSubmit(file);
  };

  return (
    <form className="rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm" onSubmit={handleSubmit(handleValidSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="proofFile">Upload bukti pembayaran</Label>
        <Input
          accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
          id="proofFile"
          type="file"
          {...register('proofFile')}
        />
        {errors.proofFile ? <p className="text-sm text-destructive">{errors.proofFile.message}</p> : null}
        <p className="text-xs text-muted-foreground">Format jpg, jpeg, png, webp, atau pdf. Maksimal 5MB.</p>
      </div>

      <Button className="mt-4" disabled={isUploading} type="submit">
        {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        Upload Bukti
      </Button>
    </form>
  );
}

export function PaymentProofPreviewPanel({ preview }: PaymentProofPreviewPanelProps) {
  if (!preview) {
    return null;
  }

  return (
    <div className="rounded-md border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        {preview.isImage ? <ImageIcon className="size-4 text-primary" /> : <FileText className="size-4 text-primary" />}
        <h2 className="font-semibold">Preview bukti pembayaran</h2>
      </div>

      {preview.isImage ? (
        <img
          alt="Preview bukti pembayaran"
          className="max-h-96 w-full rounded-md border border-border object-contain"
          src={preview.signedUrl}
        />
      ) : (
        <Button asChild variant="outline">
          <a href={preview.signedUrl} rel="noreferrer" target="_blank">
            <FileText className="size-4" />
            Buka {preview.fileName}
          </a>
        </Button>
      )}
    </div>
  );
}
