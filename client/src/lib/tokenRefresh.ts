import { getRefreshToken, saveAuthSession } from '@/lib/auth';
import type { AuthSession } from '@/lib/auth';

const API_BASE = '/api/v1';

let refreshInFlight: Promise<AuthSession | null> | null = null;

export async function refreshAccessToken(): Promise<AuthSession | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const payload = await response.json();

      if (!response.ok || payload.success === false) {
        return null;
      }

      const session = payload.data as AuthSession;
      saveAuthSession(session);
      return session;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export function clearRefreshInFlight() {
  refreshInFlight = null;
}
