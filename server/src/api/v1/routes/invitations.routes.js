import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { requireEventAccess } from '../../../middleware/rbac.middleware.js';
import { validate, validateMultiple } from '../../../middleware/validate.middleware.js';
import { PERMISSIONS } from '../../../config/roles.js';
import { eventIdParamSchema } from '../../../validators/event.validator.js';
import {
  listInvitationsQuerySchema,
  createInvitationSchema,
  updateInvitationSchema,
  invitationIdParamSchema,
  createSectionSchema,
  updateSectionSchema,
  reorderSectionsSchema,
  sectionIdParamSchema,
} from '../../../validators/invitation.validator.js';
import * as invitationController from '../../../controllers/invitation.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

const eventParams = eventIdParamSchema;
const invitationParams = eventIdParamSchema.merge(invitationIdParamSchema);
const sectionParams = eventIdParamSchema.merge(invitationIdParamSchema).merge(sectionIdParamSchema);

// ─── Invitations ─────────────────────────────────────────────────────────────

router.get(
  '/',
  validateMultiple({ params: eventParams, query: listInvitationsQuerySchema }),
  requireEventAccess(PERMISSIONS.INVITATION_READ),
  asyncHandler(invitationController.list),
);

router.post(
  '/',
  validateMultiple({ params: eventParams, body: createInvitationSchema }),
  requireEventAccess(PERMISSIONS.INVITATION_WRITE),
  asyncHandler(invitationController.create),
);

router.get(
  '/:invitationId',
  validateMultiple({ params: invitationParams }),
  requireEventAccess(PERMISSIONS.INVITATION_READ),
  asyncHandler(invitationController.get),
);

router.patch(
  '/:invitationId',
  validateMultiple({ params: invitationParams, body: updateInvitationSchema }),
  requireEventAccess(PERMISSIONS.INVITATION_WRITE),
  asyncHandler(invitationController.update),
);

router.post(
  '/:invitationId/publish',
  validateMultiple({ params: invitationParams }),
  requireEventAccess(PERMISSIONS.INVITATION_PUBLISH),
  asyncHandler(invitationController.publish),
);

router.post(
  '/:invitationId/archive',
  validateMultiple({ params: invitationParams }),
  requireEventAccess(PERMISSIONS.INVITATION_WRITE),
  asyncHandler(invitationController.archive),
);

router.get(
  '/:invitationId/rsvp-analytics',
  validateMultiple({ params: invitationParams }),
  requireEventAccess(PERMISSIONS.RSVP_READ),
  asyncHandler(invitationController.rsvpAnalytics),
);

router.delete(
  '/:invitationId',
  validateMultiple({ params: invitationParams }),
  requireEventAccess(PERMISSIONS.INVITATION_WRITE),
  asyncHandler(invitationController.remove),
);

// ─── Sections (nested) ─────────────────────────────────────────────────────

router.get(
  '/:invitationId/sections',
  validateMultiple({ params: invitationParams }),
  requireEventAccess(PERMISSIONS.INVITATION_READ),
  asyncHandler(invitationController.listSections),
);

router.post(
  '/:invitationId/sections',
  validateMultiple({ params: invitationParams, body: createSectionSchema }),
  requireEventAccess(PERMISSIONS.INVITATION_WRITE),
  asyncHandler(invitationController.createSection),
);

router.patch(
  '/:invitationId/sections/reorder',
  validateMultiple({ params: invitationParams, body: reorderSectionsSchema }),
  requireEventAccess(PERMISSIONS.INVITATION_WRITE),
  asyncHandler(invitationController.reorderSections),
);

router.patch(
  '/:invitationId/sections/:sectionId',
  validateMultiple({ params: sectionParams, body: updateSectionSchema }),
  requireEventAccess(PERMISSIONS.INVITATION_WRITE),
  asyncHandler(invitationController.updateSection),
);

router.delete(
  '/:invitationId/sections/:sectionId',
  validateMultiple({ params: sectionParams }),
  requireEventAccess(PERMISSIONS.INVITATION_WRITE),
  asyncHandler(invitationController.removeSection),
);

export default router;
