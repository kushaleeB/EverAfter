import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';

export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(AppError.badRequest('Validation failed', details));
      } else {
        next(err);
      }
    }
  };
}

export function validateMultiple(schemas) {
  return (req, _res, next) => {
    try {
      for (const [source, schema] of Object.entries(schemas)) {
        if (schema) {
          req[source] = schema.parse(req[source]);
        }
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(AppError.badRequest('Validation failed', details));
      } else {
        next(err);
      }
    }
  };
}
