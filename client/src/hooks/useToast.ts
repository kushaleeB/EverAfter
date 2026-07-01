import { useCallback, useEffect, useState } from 'react';

export function useToast(durationMs = 3500) {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = useCallback((text: string) => {
    setMessage(text);
  }, []);

  const clearToast = useCallback(() => {
    setMessage(null);
  }, []);

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => setMessage(null), durationMs);
    return () => window.clearTimeout(timer);
  }, [message, durationMs]);

  return { toast: message, showToast, clearToast };
}
