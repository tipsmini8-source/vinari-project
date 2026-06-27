const workspaceRoles = ['owner', 'partner', 'member', 'viewer'] as const;

export type WorkspaceRole = (typeof workspaceRoles)[number];

export function isWorkspaceRole(role: string | null | undefined): role is WorkspaceRole {
  return workspaceRoles.includes(role as WorkspaceRole);
}

export function canManageMembers(role: string | null | undefined) {
  return role === 'owner';
}

export function canEditWorkspace(role: string | null | undefined) {
  return role === 'owner' || role === 'partner' || role === 'member';
}

export function canCreateTransaction(role: string | null | undefined) {
  return canEditWorkspace(role);
}

export function canViewReports(role: string | null | undefined) {
  return isWorkspaceRole(role);
}
