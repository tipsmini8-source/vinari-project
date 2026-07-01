export const workspaceKeys = {
  active: (userId: string | undefined) => ['workspace', 'active', userId] as const,
  list: (userId: string | undefined) => ['workspace', 'list', userId] as const
};
