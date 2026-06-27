export type PlanCode = 'free' | 'premium_personal' | 'premium_family';

export type PlanFeatures = Record<string, boolean>;

export type Plan = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  max_workspaces: number | null;
  max_members: number | null;
  max_wallets: number | null;
  max_transactions_per_month: number | null;
  features: PlanFeatures;
  is_active: boolean;
};

export type WorkspaceSubscription = {
  id: string | null;
  workspace_id: string;
  plan_code: string;
  status: string;
  started_at: string | null;
  expired_at: string | null;
};

export type PaymentRequest = {
  id: string;
  workspace_id: string;
  user_id: string;
  plan_code: string;
  amount: number;
  method: string | null;
  proof_url: string | null;
  status: string;
  note: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  created_at: string;
};

export type PaymentProofPreview = {
  fileName: string;
  isImage: boolean;
  isPdf: boolean;
  path: string;
  signedUrl: string;
};

export type PaymentMethodType = 'qris' | 'bank_transfer' | 'ewallet' | 'manual';

export type PaymentMethod = {
  id: string;
  method_type: PaymentMethodType;
  name: string;
  account_number: string | null;
  account_name: string | null;
  bank_name: string | null;
  qr_image_url: string | null;
  qr_image_public_url: string | null;
  instructions: string | null;
  is_active: boolean;
  sort_order: number;
};

export type BillingData = {
  activePlan: Plan;
  paymentMethods: PaymentMethod[];
  paymentRequests: PaymentRequest[];
  plans: Plan[];
  subscription: WorkspaceSubscription;
};
