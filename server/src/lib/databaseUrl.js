/**
 * Normalize Postgres URL for cloud hosts (Railway, etc.) connecting to Supabase.
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

export function isSupabaseDirectUrl(url) {
  return typeof url === 'string' && /@db\.[^.]+\.supabase\.co/.test(url);
}
