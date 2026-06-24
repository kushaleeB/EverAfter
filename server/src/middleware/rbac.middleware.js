import prisma from '../lib/prisma.js';
import { AppError } from '../errors/AppError.js';
import { getEventPermissions, hasPermission, PERMISSIONS } from '../config/roles.js';

/**
 * Resolves event-level access and attaches req.eventAccess.
 * Must run after authenticate middleware.
 */
export function requireEventAccess(...requiredPermissions) {
  return async (req, _res, next) => {
    try {
      const eventId = req.params.eventId || req.body.eventId;
      if (!eventId) {
        throw AppError.badRequest('Event ID is required');
      }

      const event = await prisma.event.findFirst({
        where: { id: eventId, deletedAt: null },
      });

      if (!event) {
        throw AppError.notFound('Event');
      }

      let eventRole = null;
      let permissions = [...(req.permissions ?? [])];

      if (req.user.role === 'admin') {
        eventRole = 'owner';
        permissions = getEventPermissions('owner').concat(PERMISSIONS.ADMIN_ALL);
      } else if (event.ownerId === req.user.id) {
        eventRole = 'owner';
        permissions = getEventPermissions('owner');
      } else {
        const collab = await prisma.eventCollaborator.findUnique({
          where: {
            eventId_userId: { eventId, userId: req.user.id },
          },
        });

        if (!collab || !collab.acceptedAt) {
          throw AppError.forbidden('You do not have access to this event');
        }

        eventRole = collab.role;
        permissions = getEventPermissions(collab.role);
      }

      for (const perm of requiredPermissions) {
        if (!hasPermission(permissions, perm)) {
          throw AppError.forbidden(`Missing permission: ${perm}`);
        }
      }

      req.event = event;
      req.eventAccess = { eventRole, permissions };
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireGlobalRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(AppError.forbidden('Admin access required'));
    }
    next();
  };
}
