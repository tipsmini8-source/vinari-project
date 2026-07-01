export type Workspace = {
  id: string;
  name: string;
  currency_code: string;
  role: string;
};

export type WorkspaceContextValue = {
  workspace: Workspace | null;
  workspaces: Workspace[];
  loading: boolean;
  error: Error | null;
  refreshWorkspace: () => Promise<void>;
  setActiveWorkspace: (workspaceId: string) => Promise<void>;
};
