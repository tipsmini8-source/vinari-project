export const workspaceKeys = {
  active: (userId: string | undefined) => ['workspace', 'active', userId] as const
};
