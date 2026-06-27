import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_NAME: z.string().min(1).default('Vinari'),
  VITE_APP_ENV: z.enum(['local', 'development', 'staging', 'production']).default('local'),
  VITE_SUPABASE_URL: z.string().default(''),
  VITE_SUPABASE_ANON_KEY: z.string().default('')
});

export const env = envSchema.parse(import.meta.env);
