export type AdminPaymentStatus = 'all' | 'pending' | 'approved' | 'rejected';

export type AdminPaymentRequest = {
  id: string;
  workspace_id: string;
  user_id: string;
  plan_code: string;
  amount: number;
  method: string | null;
  proof_url: string | null;
  status: string;
  note: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  created_at: string;
};

export type AdminPaymentStats = {
  pending: number;
  approved: number;
  rejected: number;
};

export type AdminPaymentProofPreview = {
  fileName: string;
  isImage: boolean;
  isPdf: boolean;
  path: string;
  signedUrl: string;
};

export type AdminPaymentMethodType = 'qris' | 'bank_transfer' | 'ewallet' | 'manual';

export type AdminPaymentMethod = {
  id: string;
  method_type: AdminPaymentMethodType;
  name: string;
  account_number: string | null;
  account_name: string | null;
  bank_name: string | null;
  qr_image_url: string | null;
  qr_image_public_url: string | null;
  instructions: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};
