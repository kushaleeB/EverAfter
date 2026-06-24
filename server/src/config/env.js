import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../../.env') });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1).optional(),
  SUPABASE_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(32).default('dev-access-secret-change-in-production-32chars'),
  JWT_REFRESH_SECRET: z.string().min(32).default('dev-refresh-secret-change-in-production-32ch'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  PASSWORD_RESET_EXPIRES_HOURS: z.coerce.number().default(1),
  APP_URL: z.string().url().default('http://localhost:5173'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

export default {
  ...env,
  databaseUrl: env.DATABASE_URL || env.SUPABASE_URL,
  isProduction: env.NODE_ENV === 'production',
  maxFileSizeBytes: env.MAX_FILE_SIZE_MB * 1024 * 1024,
};
