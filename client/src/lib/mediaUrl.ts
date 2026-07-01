import { resolveMediaUrl } from '@/lib/apiBase';

/** Resolve stored media paths for display (local /uploads, Supabase, or absolute URLs). */
export function resolveOptionalMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return resolveMediaUrl(url);
}

export function resolveRequiredMediaUrl(url: string): string {
  return resolveMediaUrl(url);
}
