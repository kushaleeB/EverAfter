import { Prisma } from '@prisma/client';
import env from '../config/env.js';
import { AppError } from '../errors/AppError.js';
import { ErrorCodes } from '../errors/errorCodes.js';

export function notFoundHandler(_req, _res, next) {
  next(AppError.notFound('Route'));
}

export function errorHandler(err, req, res, _next) {
  let error = err;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0] ?? 'field';
      error = AppError.conflict(`Duplicate value for ${field}`);
    } else if (err.code === 'P2025') {
      error = AppError.notFound('Record');
    } else {
      error = new AppError('Database operation failed', 500, ErrorCodes.INTERNAL_ERROR);
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    console.error(`[${req.requestId}] Database connection failed:`, err.message);
    error = new AppError('Database unavailable. Please try again.', 503, ErrorCodes.INTERNAL_ERROR);
  }

  const statusCode = error.statusCode || 500;
  const code = error.code || ErrorCodes.INTERNAL_ERROR;
  const message = error.isOperational ? error.message : 'Internal server error';

  if (!error.isOperational && !env.isProduction) {
    console.error(err);
  } else if (statusCode >= 500) {
    console.error(`[${req.requestId}]`, err.message);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(error.details && { details: error.details }),
      ...(req.requestId && { requestId: req.requestId }),
    },
  });
}
