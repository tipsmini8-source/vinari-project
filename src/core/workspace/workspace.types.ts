export type Workspace = {
  id: string;
  name: string;
  currency_code: string;
  role: string;
};

export type WorkspaceContextValue = {
  workspace: Workspace | null;
  loading: boolean;
  error: Error | null;
  refreshWorkspace: () => Promise<void>;
};
