import { supabase } from '@/lib/supabase';
import type { Workspace } from '@/core/workspace/workspace.types';

type SupabaseErrorLike = {
  message?: string;
};

type WorkspaceMemberRow = {
  role: string;
  workspace:
    | {
        id: string;
        name: string;
        currency_code: string;
      }
    | Array<{
        id: string;
        name: string;
        currency_code: string;
      }>
    | null;
};

function assertSupabaseSuccess(error: SupabaseErrorLike | null, fallbackMessage: string) {
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
}

function normalizeWorkspace(row: WorkspaceMemberRow | null): Workspace | null {
  const workspace = Array.isArray(row?.workspace) ? row.workspace[0] : row?.workspace;

  if (!workspace) {
    return null;
  }

  return {
    id: workspace.id,
    name: workspace.name,
    currency_code: workspace.currency_code,
    role: row?.role ?? 'viewer'
  };
}

export const WorkspaceService = {
  async getFirstWorkspace(userId: string): Promise<Workspace | null> {
    const { data, error } = (await supabase
      .from('workspace_members')
      .select('role, workspace:workspaces(id, name, currency_code)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()) as unknown as {
      data: WorkspaceMemberRow | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil workspace aktif.');

    return normalizeWorkspace(data);
  }
};
