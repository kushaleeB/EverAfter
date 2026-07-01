const configured = import.meta.env.VITE_API_BASE_URL?.trim();
const proxyTarget = import.meta.env.VITE_API_PROXY_TARGET?.trim();

/** Relative `/api/v1` in dev (Vite proxy); full URL in production (Railway). */
export const API_BASE = configured ? configured.replace(/\/$/, '') : '/api/v1';

function mediaOrigin(): string | null {
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      return null;
    }
  }
  if (proxyTarget) {
    try {
      return new URL(proxyTarget).origin;
    } catch {
      return null;
    }
  }
  return null;
}

/** Resolve `/uploads/...` to the API host; leave other paths (e.g. `/img/`) unchanged. */
export function resolveMediaUrl(fileUrl: string): string {
  if (!fileUrl) return fileUrl;
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }
  if (!fileUrl.startsWith('/uploads/')) {
    return fileUrl;
  }
  const origin = mediaOrigin();
  if (origin) {
    return `${origin}${fileUrl}`;
  }
  return fileUrl;
}
