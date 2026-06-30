import { apiRequest } from '@/lib/api';
import type { AuthSession, AuthUser } from '@/lib/auth';

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export function registerUser(payload: RegisterPayload) {
  return apiRequest<AuthSession>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: LoginPayload) {
  return apiRequest<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function loginWithGoogle(payload: { accessToken: string }) {
  return apiRequest<AuthSession>('/auth/google', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function logoutUser(refreshToken: string) {
  return apiRequest<void>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export function getMe() {
  return apiRequest<AuthUser>('/auth/me');
}

export function changePassword(payload: ChangePasswordPayload) {
  return apiRequest<{ message: string }>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function logoutAllSessions() {
  return apiRequest<void>('/auth/logout-all', { method: 'POST' });
}

export function forgotPassword(payload: ForgotPasswordPayload) {
  return apiRequest<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function resetPassword(payload: ResetPasswordPayload) {
  return apiRequest<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
