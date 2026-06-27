import type { AuthError, Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput
} from '@features/auth/types/auth.types';

function getAuthRedirectUrl(path: string) {
  return `${window.location.origin}${path}`;
}

function throwIfAuthError(error: AuthError | null) {
  if (error) {
    throw new Error(error.message);
  }
}

export const AuthService = {
  async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();
    throwIfAuthError(error);

    return data.session;
  },

  onAuthStateChange(callback: (session: Session | null) => void) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });

    return data.subscription;
  },

  async login(input: LoginInput) {
    const { error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password
    });

    throwIfAuthError(error);
  },

  async register(input: RegisterInput) {
    const { error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName
        },
        emailRedirectTo: getAuthRedirectUrl('/verify-email')
      }
    });

    throwIfAuthError(error);
    await supabase.auth.signOut();
  },

  async forgotPassword(input: ForgotPasswordInput) {
    const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
      redirectTo: getAuthRedirectUrl('/reset-password')
    });

    throwIfAuthError(error);
  },

  async resetPassword(input: ResetPasswordInput) {
    const { error } = await supabase.auth.updateUser({
      password: input.password
    });

    throwIfAuthError(error);
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    throwIfAuthError(error);
  }
};
