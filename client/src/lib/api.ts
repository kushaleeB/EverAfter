import { getAccessToken } from '@/lib/auth';
import { refreshAccessToken } from '@/lib/tokenRefresh';
import { useAuthStore } from '@/stores/authStore';
import type { PaginationMeta } from '@/types/api';

const API_BASE = '/api/v1';

const AUTH_RETRY_SKIP_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/google',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/logout',
];

export interface ApiSuccessBody<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestConfig {
  skipAuthRetry?: boolean;
}

function shouldSkipAuthRetry(path: string, config: RequestConfig) {
  return config.skipAuthRetry || AUTH_RETRY_SKIP_PATHS.some((p) => path.startsWith(p));
}

async function handleUnauthorized(path: string, config: RequestConfig): Promise<boolean> {
  if (shouldSkipAuthRetry(path, config)) {
    return false;
  }

  const session = await refreshAccessToken();
  if (session) {
    useAuthStore.getState().setSession(session);
    return true;
  }

  useAuthStore.getState().clearSession();

  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.assign('/login');
  }

  return false;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json();

  if (!response.ok || payload.success === false) {
    const error = payload as ApiErrorBody;
    throw new ApiError(
      error.error?.message ?? 'Request failed',
      response.status,
      error.error?.code,
      error.error?.details,
    );
  }

  return payload.data as T;
}

async function executeRequest<T>(
  path: string,
  options: RequestInit = {},
  config: RequestConfig = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !shouldSkipAuthRetry(path, config)) {
    const refreshed = await handleUnauthorized(path, config);
    if (refreshed) {
      return executeRequest<T>(path, options, { ...config, skipAuthRetry: true });
    }
  }

  return parseResponse<T>(response);
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  config: RequestConfig = {},
): Promise<T> {
  return executeRequest<T>(path, options, config);
}

export async function apiRequestWithMeta<T>(
  path: string,
  options: RequestInit = {},
  config: RequestConfig = {},
): Promise<{ data: T; meta: PaginationMeta }> {
  const headers = new Headers(options.headers);

  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !shouldSkipAuthRetry(path, config)) {
    const refreshed = await handleUnauthorized(path, config);
    if (refreshed) {
      return apiRequestWithMeta<T>(path, options, { ...config, skipAuthRetry: true });
    }
  }

  if (response.status === 204) {
    return {
      data: undefined as T,
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  const payload = (await response.json()) as ApiSuccessBody<T> | ApiErrorBody;

  if (!response.ok || payload.success === false) {
    const error = payload as ApiErrorBody;
    throw new ApiError(
      error.error?.message ?? 'Request failed',
      response.status,
      error.error?.code,
      error.error?.details,
    );
  }

  const success = payload as ApiSuccessBody<T>;
  return {
    data: success.data,
    meta: success.meta ?? {
      page: 1,
      limit: 20,
      total: Array.isArray(success.data) ? success.data.length : 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };
}

export async function apiUpload<T>(
  path: string,
  formData: FormData,
  config: RequestConfig = {},
): Promise<T> {
  const headers = new Headers();
  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (response.status === 401 && !shouldSkipAuthRetry(path, config)) {
    const refreshed = await handleUnauthorized(path, config);
    if (refreshed) {
      return apiUpload<T>(path, formData, { ...config, skipAuthRetry: true });
    }
  }

  return parseResponse<T>(response);
}
