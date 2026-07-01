/**
 * Normalize Postgres URLs for Prisma + Supabase (Railway, pooler, SSL).
 */
export function normalizeDatabaseUrl(url) {
  if (!url || typeof url !== 'string') return url;

  let normalized = url.trim();

  // Railway sometimes stores values with surrounding quotes.
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1);
  }

  if (!normalized.startsWith('postgresql://') && !normalized.startsWith('postgres://')) {
    return normalized;
  }

  if (normalized.includes('supabase.co') && !normalized.includes('sslmode=')) {
    normalized += normalized.includes('?') ? '&' : '?';
    normalized += 'sslmode=require';
  }

  return normalized;
}

/** Legacy direct host — often unreachable from Railway (IPv6). */
export function isSupabaseDirectUrl(url) {
  return typeof url === 'string' && /@db\.[^.]+\.supabase\.co/.test(url);
}

export function isSupabasePoolerUrl(url) {
  return typeof url === 'string' && /pooler\.supabase\.com/.test(url);
}

export function deriveSupabaseProjectRef(databaseUrl) {
  if (!databaseUrl) return undefined;

  const directMatch = databaseUrl.match(/@db\.([^.]+)\.supabase\.co/);
  if (directMatch) return directMatch[1];

  const poolerUserMatch = databaseUrl.match(/\/\/postgres\.([^:@]+)@/);
  if (poolerUserMatch) return poolerUserMatch[1];

  return undefined;
}

export function deriveSupabaseProjectUrl(databaseUrl, explicitUrl) {
  if (explicitUrl?.startsWith('https://')) {
    return explicitUrl.replace(/\/$/, '');
  }

  const projectRef = deriveSupabaseProjectRef(databaseUrl);
  if (projectRef) {
    return `https://${projectRef}.supabase.co`;
  }

  return undefined;
}
