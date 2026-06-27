import { useContext } from 'react';

import { AuthContext } from '@features/auth/components/auth.context';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  }

  return context;
}
