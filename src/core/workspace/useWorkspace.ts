import { useContext } from 'react';

import { WorkspaceContext } from '@/core/workspace/WorkspaceContext';

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error('useWorkspace harus digunakan di dalam WorkspaceProvider.');
  }

  return context;
}
