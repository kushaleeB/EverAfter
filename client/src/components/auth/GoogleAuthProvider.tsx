import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { API_BASE } from '@/lib/apiBase';

interface GoogleAuthContextValue {
  clientId: string | null;
  isReady: boolean;
}

const GoogleAuthContext = createContext<GoogleAuthContextValue>({
  clientId: null,
  isReady: false,
});

export function useGoogleAuth() {
  return useContext(GoogleAuthContext);
}

interface AppGoogleAuthProviderProps {
  children: ReactNode;
}

export function AppGoogleAuthProvider({ children }: AppGoogleAuthProviderProps) {
  const [clientId, setClientId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (envClientId) {
        if (!cancelled) {
          setClientId(envClientId);
          setIsReady(true);
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/config`);
        if (!response.ok) return;

        const payload = await response.json();
        const id = payload?.data?.googleClientId;
        if (!cancelled && typeof id === 'string' && id.length > 0) {
          setClientId(id);
        }
      } catch {
        // Server may be unavailable during local setup.
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    }

    void loadConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  const contextValue = { clientId, isReady };

  if (!clientId) {
    return (
      <GoogleAuthContext.Provider value={contextValue}>{children}</GoogleAuthContext.Provider>
    );
  }

  return (
    <GoogleAuthContext.Provider value={contextValue}>
      <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>
    </GoogleAuthContext.Provider>
  );
}
