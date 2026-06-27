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
    const message = error.message.toLowerCase();

    if (message.includes('invalid login credentials')) {
      throw new Error('Email atau password tidak sesuai.');
    }

    if (message.includes('email not confirmed')) {
      throw new Error('Email belum diverifikasi. Silakan cek inbox Anda.');
    }

    if (message.includes('user already registered') || message.includes('already registered')) {
      throw new Error('Email ini sudah terdaftar. Silakan login.');
    }

    if (message.includes('password')) {
      throw new Error('Password belum memenuhi ketentuan atau tautan reset sudah kedaluwarsa.');
    }

    throw new Error('Permintaan autentikasi gagal. Silakan coba lagi.');
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password
    });

    throwIfAuthError(error);

    return data.session;
  },

  async register(input: RegisterInput) {
    const { data, error } = await supabase.auth.signUp({
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

    return data.session;
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
