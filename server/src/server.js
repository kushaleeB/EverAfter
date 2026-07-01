import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../.env') });
dotenv.config();

if (!process.env.DATABASE_URL && process.env.SUPABASE_URL?.startsWith('postgresql')) {
  process.env.DATABASE_URL = process.env.SUPABASE_URL;
}

const { default: app } = await import('./app.js');
const { default: env } = await import('./config/env.js');
const { default: prisma, connectPrisma } = await import('./lib/prisma.js');

try {
  await connectPrisma();
  console.log('Prisma connected to PostgreSQL');
} catch (err) {
  console.error('Prisma failed to connect to PostgreSQL:', err.message);
  if (env.isProduction) {
    process.exit(1);
  }
}

const { isStorageConfigured } = await import('./lib/supabaseStorage.js');
const uploadMode =
  env.UPLOAD_STORAGE === 'local'
    ? 'local disk'
    : isStorageConfigured()
      ? `supabase bucket "${env.SUPABASE_STORAGE_BUCKET}"`
      : env.isProduction
        ? 'MISSING — set SUPABASE_SERVICE_ROLE_KEY'
        : 'local disk (dev fallback)';
console.log(`Media uploads: ${uploadMode}`);

const PORT = env.PORT;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`EverAfter API v1 listening on ${HOST}:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process or change PORT in .env`);
    console.error(`  PowerShell: Get-NetTCPConnection -LocalPort ${PORT} | Select OwningProcess`);
    process.exit(1);
  }
  throw err;
});

async function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
