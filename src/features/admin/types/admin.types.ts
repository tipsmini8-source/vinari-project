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
