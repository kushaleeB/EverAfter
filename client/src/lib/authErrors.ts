import { ApiError } from '@/lib/api';

export interface AuthFieldErrors {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  general?: string;
}

interface ValidationDetail {
  field?: string;
  message?: string;
}

export function mapAuthError(error: unknown): AuthFieldErrors {
  if (!(error instanceof ApiError)) {
    return { general: 'Something went wrong. Please try again.' };
  }

  if (error.code === 'RATE_LIMITED' || error.status === 429) {
    return { general: 'Too many attempts. Please try again later.' };
  }

  if (error.status === 409 || error.code === 'CONFLICT') {
    return { email: 'An account with this email already exists.' };
  }

  if (error.status === 401 || error.code === 'UNAUTHORIZED') {
    return { general: 'Enter the correct email and password.' };
  }

  if (error.status === 400 && error.code === 'VALIDATION_ERROR') {
    const details = Array.isArray(error.details)
      ? (error.details as ValidationDetail[])
      : [];
    const fieldErrors: AuthFieldErrors = {};

    for (const detail of details) {
      const field = detail.field;
      if (
        field === 'email' ||
        field === 'password' ||
        field === 'firstName' ||
        field === 'lastName'
      ) {
        fieldErrors[field] = detail.message;
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      return fieldErrors;
    }

    return { general: error.message || 'Please check your input and try again.' };
  }

  return { general: error.message || 'Something went wrong. Please try again.' };
}

export function authFieldErrorsToMessage(errors: AuthFieldErrors): string {
  return (
    errors.general ||
    errors.email ||
    errors.password ||
    errors.firstName ||
    errors.lastName ||
    'Something went wrong. Please try again.'
  );
}
