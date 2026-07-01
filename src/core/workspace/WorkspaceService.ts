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
  activeWorkspaceStorageKey: 'vinari_active_workspace_id',

  getStoredActiveWorkspaceId() {
    return window.localStorage.getItem(this.activeWorkspaceStorageKey);
  },

  setStoredActiveWorkspaceId(workspaceId: string) {
    window.localStorage.setItem(this.activeWorkspaceStorageKey, workspaceId);
  },

  clearStoredActiveWorkspaceId() {
    window.localStorage.removeItem(this.activeWorkspaceStorageKey);
  },

  selectActiveWorkspace(workspaces: Workspace[]): Workspace | null {
    if (workspaces.length === 0) {
      this.clearStoredActiveWorkspaceId();
      return null;
    }

    const storedWorkspaceId = this.getStoredActiveWorkspaceId();
    const storedWorkspace = workspaces.find((workspace) => workspace.id === storedWorkspaceId);

    if (storedWorkspace) {
      return storedWorkspace;
    }

    if (storedWorkspaceId) {
      this.clearStoredActiveWorkspaceId();
    }

    const fallbackWorkspace = workspaces[0];
    this.setStoredActiveWorkspaceId(fallbackWorkspace.id);

    return fallbackWorkspace;
  },

  async getWorkspaces(userId: string): Promise<Workspace[]> {
    const { data, error } = (await supabase
      .from('workspace_members')
      .select('role, workspace:workspaces(id, name, currency_code)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('created_at', { ascending: true })) as unknown as {
      data: WorkspaceMemberRow[] | null;
      error: SupabaseErrorLike | null;
    };

    assertSupabaseSuccess(error, 'Gagal mengambil daftar workspace.');

    return (data ?? []).map(normalizeWorkspace).filter((workspace): workspace is Workspace => Boolean(workspace));
  },

  async getFirstWorkspace(userId: string): Promise<Workspace | null> {
    const workspaces = await this.getWorkspaces(userId);

    return workspaces[0] ?? null;
  }
};
