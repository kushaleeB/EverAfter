const configuredAppUrl = import.meta.env.VITE_APP_URL?.trim().replace(/\/$/, '');

/** Public invitation URL served by the frontend app. */
export function buildPublicInviteUrl(slug: string) {
  const base =
    configuredAppUrl ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');
  return `${base}/invite/${slug}`;
}

/** Prefer API-provided URL when publishing; fall back to client-built URL. */
export function resolvePublicInviteUrl(slug: string, publicUrl?: string | null) {
  if (publicUrl?.trim()) return publicUrl.trim();
  return buildPublicInviteUrl(slug);
}
