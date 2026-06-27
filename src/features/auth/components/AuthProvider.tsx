import { useCallback, useEffect, useMemo, type PropsWithChildren } from 'react';

import { AuthContext } from '@features/auth/components/auth.context';
import { AuthService } from '@features/auth/services/auth.service';
import { useAuthStore } from '@features/auth/stores/auth.store';
import type {
  AuthContextValue,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput
} from '@features/auth/types/auth.types';

export function AuthProvider({ children }: PropsWithChildren) {
  const { loading, session, setLoading, setSession, user } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    void AuthService.getSession()
      .then((currentSession) => {
        if (mounted) {
          setSession(currentSession);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    const subscription = AuthService.onAuthStateChange((nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setLoading, setSession]);

  const login = useCallback(
    async (input: LoginInput) => {
      const nextSession = await AuthService.login(input);

      if (nextSession) {
        setSession(nextSession);
      }

      return nextSession;
    },
    [setSession]
  );
  const logout = useCallback(async () => {
    await AuthService.logout();
    setSession(null);
  }, [setSession]);
  const register = useCallback(
    async (input: RegisterInput) => {
      const nextSession = await AuthService.register(input);

      if (nextSession) {
        setSession(nextSession);
      }

      return nextSession;
    },
    [setSession]
  );
  const forgotPassword = useCallback(
    (input: ForgotPasswordInput) => AuthService.forgotPassword(input),
    []
  );
  const resetPassword = useCallback((input: ResetPasswordInput) => AuthService.resetPassword(input), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      login,
      logout,
      register,
      forgotPassword,
      resetPassword
    }),
    [forgotPassword, loading, login, logout, register, resetPassword, session, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
