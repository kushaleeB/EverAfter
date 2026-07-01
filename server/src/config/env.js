import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { z } from 'zod';
import {
  deriveSupabaseProjectUrl,
  isSupabaseDirectUrl,
  isSupabasePoolerUrl,
  normalizeDatabaseUrl,
} from '../lib/databaseUrl.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../../.env') });
dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3001),
    DATABASE_URL: z.string().min(1).optional(),
    DIRECT_URL: z.string().min(1).optional(),
    SUPABASE_URL: z.string().optional(),
    JWT_ACCESS_SECRET: z.string().min(32).default('dev-access-secret-change-in-production-32chars'),
    JWT_REFRESH_SECRET: z.string().min(32).default('dev-refresh-secret-change-in-production-32ch'),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    PASSWORD_RESET_EXPIRES_HOURS: z.coerce.number().default(1),
    APP_URL: z.string().url().default('http://localhost:5173'),
    CORS_ORIGIN: z.string().default('http://localhost:5173'),
    GOOGLE_CLIENT_ID: z.string().optional(),
    SUPABASE_PROJECT_URL: z.string().url().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    SUPABASE_STORAGE_BUCKET: z.string().default('ever-after'),
    UPLOAD_DIR: z.string().default('uploads'),
    MAX_FILE_SIZE_MB: z.coerce.number().default(10),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),
    RATE_LIMIT_MAX: z.coerce.number().default(100),
  })
  .superRefine((data, ctx) => {
    const databaseUrl = data.DATABASE_URL || data.SUPABASE_URL;
    if (data.NODE_ENV === 'production' && !databaseUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'DATABASE_URL (or SUPABASE_URL) is required in production',
        path: ['DATABASE_URL'],
      });
    }
    if (data.NODE_ENV === 'production' && !data.SUPABASE_SERVICE_ROLE_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'SUPABASE_SERVICE_ROLE_KEY is required in production for file uploads',
        path: ['SUPABASE_SERVICE_ROLE_KEY'],
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;
const rawDatabaseUrl = env.DATABASE_URL || env.SUPABASE_URL;
const databaseUrl = normalizeDatabaseUrl(rawDatabaseUrl);
const directDatabaseUrl = normalizeDatabaseUrl(env.DIRECT_URL || rawDatabaseUrl);

if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
}

if (directDatabaseUrl) {
  process.env.DIRECT_URL = directDatabaseUrl;
}

if (env.NODE_ENV === 'production' && isSupabaseDirectUrl(databaseUrl)) {
  console.warn(
    '[env] DATABASE_URL uses Supabase direct host (db.*.supabase.co). ' +
      'Use the pooler URI from Supabase → Database → Connection string (Prisma ORM tab).',
  );
}

if (env.NODE_ENV === 'production' && databaseUrl && !isSupabasePoolerUrl(databaseUrl)) {
  console.warn(
    '[env] DATABASE_URL is not using pooler.supabase.com. Railway may fail to connect.',
  );
}

function parseCorsOrigins(value) {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export default {
  ...env,
  databaseUrl,
  directDatabaseUrl,
  supabaseProjectUrl: deriveSupabaseProjectUrl(databaseUrl, env.SUPABASE_PROJECT_URL),
  corsOrigins: parseCorsOrigins(env.CORS_ORIGIN),
  isProduction: env.NODE_ENV === 'production',
  maxFileSizeBytes: env.MAX_FILE_SIZE_MB * 1024 * 1024,
};
