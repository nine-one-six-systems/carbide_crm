import { z } from 'zod';

/**
 * Environment variable schema
 * All required environment variables must be defined here
 */
const envSchema = z.object({
  // Supabase
  VITE_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  
  // Optional: App configuration
  VITE_APP_NAME: z.string().default('Carbide CRM'),
  VITE_APP_VERSION: z.string().default('1.0.0'),
  
  // Optional: Feature flags
  VITE_ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  VITE_ENABLE_DEBUG: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const env = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
    VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
    VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
    VITE_ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG,
  };

  const result = envSchema.safeParse(env);

  if (!result.success) {
    const errors = result.error.format();
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(errors, null, 2));
    
    // In development, throw error to alert developer
    if (import.meta.env.DEV) {
      throw new Error(
        `Invalid environment variables: ${result.error.errors.map((e) => e.message).join(', ')}`
      );
    }
    
    // In production, log error but don't crash
    console.error('Environment validation failed in production');
  }

  return result.data as Env;
}

export const env = validateEnv();

// Export individual values for convenience
export const {
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY,
  VITE_APP_NAME,
  VITE_APP_VERSION,
  VITE_ENABLE_ANALYTICS,
  VITE_ENABLE_DEBUG,
} = env;

