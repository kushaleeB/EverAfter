import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface AuthBootstrapProps {
  children: ReactNode;
}

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const initialize = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  if (!isInitialized || isLoading) {
    return null;
  }

  return children;
}
