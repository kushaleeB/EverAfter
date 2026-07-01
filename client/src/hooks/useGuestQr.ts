import { useCallback, useEffect, useRef, useState } from 'react';
import { publicApi } from '@/api/public';
import type { GuestQrData } from '@/types/public';
import { guestQrQueryKey } from '@/types/public';

const qrCache = new Map<string, GuestQrData>();

function cacheKey(slug: string, accessToken: string) {
  return `${slug}:${accessToken}`;
}

export function useGuestQr(slug: string | undefined, accessToken: string | undefined, enabled = true) {
  const key = slug && accessToken ? guestQrQueryKey(slug, accessToken) : null;
  const [data, setData] = useState<GuestQrData | null>(() => {
    if (!slug || !accessToken) return null;
    return qrCache.get(cacheKey(slug, accessToken)) ?? null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const requestIdRef = useRef(0);

  const fetchQr = useCallback(async () => {
    if (!slug || !accessToken || !enabled) return;

    const storageKey = cacheKey(slug, accessToken);
    const cached = qrCache.get(storageKey);
    if (cached) {
      setData(cached);
      setError(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const result = await publicApi.getGuestQr(slug, accessToken);
      if (requestId !== requestIdRef.current) return;
      qrCache.set(storageKey, result);
      setData(result);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err : new Error('Failed to load guest QR code.'));
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [slug, accessToken, enabled]);

  useEffect(() => {
    void fetchQr();
  }, [fetchQr]);

  const invalidate = useCallback(() => {
    if (!slug || !accessToken) return;
    qrCache.delete(cacheKey(slug, accessToken));
    void fetchQr();
  }, [slug, accessToken, fetchQr]);

  return {
    data,
    isLoading,
    error,
    queryKey: key,
    refetch: fetchQr,
    invalidate,
  };
}

export function invalidateGuestQr(slug: string, accessToken: string) {
  qrCache.delete(cacheKey(slug, accessToken));
}
