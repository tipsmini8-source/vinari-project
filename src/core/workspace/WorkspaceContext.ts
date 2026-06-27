import { createContext } from 'react';

import type { WorkspaceContextValue } from '@/core/workspace/workspace.types';

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
