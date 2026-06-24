import { ErrorCodes } from './errorCodes.js';

export class AppError extends Error {
  constructor(message, statusCode = 500, code = ErrorCodes.INTERNAL_ERROR, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details) {
    return new AppError(message, 400, ErrorCodes.VALIDATION_ERROR, details);
  }

  static unauthorized(message = 'Authentication required') {
    return new AppError(message, 401, ErrorCodes.UNAUTHORIZED);
  }

  static forbidden(message = 'Insufficient permissions') {
    return new AppError(message, 403, ErrorCodes.FORBIDDEN);
  }

  static notFound(resource = 'Resource') {
    return new AppError(`${resource} not found`, 404, ErrorCodes.NOT_FOUND);
  }

  static conflict(message) {
    return new AppError(message, 409, ErrorCodes.CONFLICT);
  }

  static subscriptionLimit(message) {
    return new AppError(message, 403, ErrorCodes.SUBSCRIPTION_LIMIT);
  }
}
