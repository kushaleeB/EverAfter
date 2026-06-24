import dotenv from 'dotenv';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootEnv = resolve(__dirname, '../../.env');
dotenv.config({ path: rootEnv });

const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error('FAIL: No DATABASE_URL or SUPABASE_URL found in .env');
  process.exit(1);
}

// Mask credentials in logs
const masked = connectionString.replace(/:([^:@/]+)@/, ':***@');
console.log(`Connecting to: ${masked}`);

const pool = new pg.Pool({
  connectionString,
  ssl: connectionString.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 10000,
});

try {
  const client = await pool.connect();
  const version = await client.query('SELECT version()');
  const dbName = await client.query('SELECT current_database()');
  const tables = await client.query(`
    SELECT COUNT(*)::int AS count
    FROM information_schema.tables
    WHERE table_schema = 'public'
  `);

  console.log('SUCCESS: Connected to PostgreSQL');
  console.log(`  Database: ${dbName.rows[0].current_database}`);
  console.log(`  Public tables: ${tables.rows[0].count}`);
  console.log(`  Server: ${version.rows[0].version.split(',')[0]}`);

  client.release();
  await pool.end();
  process.exit(0);
} catch (err) {
  console.error('FAIL: Could not connect');
  console.error(`  ${err.message}`);
  await pool.end();
  process.exit(1);
}
