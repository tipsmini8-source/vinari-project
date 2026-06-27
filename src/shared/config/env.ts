import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().default(''),
  VITE_SUPABASE_ANON_KEY: z.string().default('')
});

export const env = envSchema.parse(import.meta.env);
