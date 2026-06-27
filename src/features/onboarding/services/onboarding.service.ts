import { supabase } from '@/lib/supabase';
import type { OnboardingInput, WorkspaceSummary } from '@features/onboarding/types/onboarding.types';

type SupabaseErrorLike = {
  message?: string;
};

type CreateWorkspaceRpcResult = {
  data: string | null;
  error: SupabaseErrorLike | null;
};

function assertSupabaseSuccess(error: SupabaseErrorLike | null, fallbackMessage: string) {
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
}

export const OnboardingService = {
  async getActiveWorkspace(userId: string): Promise<WorkspaceSummary | null> {
    const { data, error } = await supabase
      .from('workspace_members')
      .select('workspace:workspaces(id, name)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle();

    assertSupabaseSuccess(error, 'Gagal memeriksa workspace aktif.');

    const workspace = data?.workspace;

    if (!workspace) {
      return null;
    }

    if (Array.isArray(workspace)) {
      return workspace[0] ?? null;
    }

    return workspace;
  },

  async createInitialData(_userId: string, input: OnboardingInput): Promise<WorkspaceSummary> {
    const { data: workspaceId, error } = (await supabase.rpc('create_workspace', {
      workspace_name: input.workspaceName,
      currency_code: input.currencyCode,
      wallet_name: input.walletName,
      opening_balance: input.initialBalance,
      usage_type: input.usageType
    })) as unknown as CreateWorkspaceRpcResult;

    assertSupabaseSuccess(error, 'Gagal membuat workspace.');

    if (!workspaceId) {
      throw new Error('Workspace tidak berhasil dibuat.');
    }

    return {
      id: workspaceId,
      name: input.workspaceName
    };
  }
};
