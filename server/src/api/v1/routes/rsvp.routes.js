import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { requireEventAccess } from '../../../middleware/rbac.middleware.js';
import { validate, validateMultiple } from '../../../middleware/validate.middleware.js';
import { PERMISSIONS } from '../../../config/roles.js';
import { eventIdParamSchema } from '../../../validators/event.validator.js';
import {
  listRsvpsQuerySchema,
  hostUpdateRsvpSchema,
  rsvpIdParamSchema,
} from '../../../validators/rsvp.validator.js';
import * as rsvpController from '../../../controllers/rsvp.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

const eventParams = eventIdParamSchema;
const rsvpParams = eventIdParamSchema.merge(rsvpIdParamSchema);

router.get(
  '/analytics',
  validateMultiple({ params: eventParams }),
  requireEventAccess(PERMISSIONS.RSVP_READ),
  asyncHandler(rsvpController.eventAnalytics),
);

router.get(
  '/',
  validateMultiple({ params: eventParams, query: listRsvpsQuerySchema }),
  requireEventAccess(PERMISSIONS.RSVP_READ),
  asyncHandler(rsvpController.list),
);

router.patch(
  '/:rsvpId',
  validateMultiple({ params: rsvpParams, body: hostUpdateRsvpSchema }),
  requireEventAccess(PERMISSIONS.GUEST_WRITE),
  asyncHandler(rsvpController.updateByHost),
);

export default router;
