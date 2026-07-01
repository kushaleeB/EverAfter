const configured = import.meta.env.VITE_API_BASE_URL?.trim();

/** Relative `/api/v1` in dev (Vite proxy); full URL in production (Railway). */
export const API_BASE = configured ? configured.replace(/\/$/, '') : '/api/v1';

function apiOrigin(): string | null {
  if (!configured) return null;
  try {
    return new URL(configured).origin;
  } catch {
    return null;
  }
}

/** Resolve relative `/uploads/...` paths to the API host (legacy local uploads). */
export function resolveMediaUrl(fileUrl: string): string {
  if (!fileUrl) return fileUrl;
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }
  const origin = apiOrigin();
  if (origin && fileUrl.startsWith('/')) {
    return `${origin}${fileUrl}`;
  }
  return fileUrl;
}
