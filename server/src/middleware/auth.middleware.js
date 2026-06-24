import { verifyAccessToken } from '../lib/jwt.js';
import prisma from '../lib/prisma.js';
import { AppError } from '../errors/AppError.js';
import { PERMISSIONS } from '../config/roles.js';

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw AppError.unauthorized('Missing or invalid authorization header');
    }

    const token = header.slice(7);
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findFirst({
      where: { id: decoded.sub, deletedAt: null },
    });

    if (!user) {
      throw AppError.unauthorized('User account not found or deactivated');
    }

    req.user = user;
    req.permissions = user.role === 'admin' ? [PERMISSIONS.ADMIN_ALL] : [];
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Invalid or expired access token'));
    }
    next(err);
  }
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();

  authenticate(req, _res, next);
}
