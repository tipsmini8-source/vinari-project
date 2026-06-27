import type { Session, User } from '@supabase/supabase-js';

import type {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema
} from '@features/auth/schemas/auth.schemas';
import type { z } from 'zod';

export type AuthUser = User;
export type AuthSession = Session;

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export type AuthContextValue = {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<AuthSession | null>;
  logout: () => Promise<void>;
  register: (input: RegisterInput) => Promise<AuthSession | null>;
  forgotPassword: (input: ForgotPasswordInput) => Promise<void>;
  resetPassword: (input: ResetPasswordInput) => Promise<void>;
};
