import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { validate, validateMultiple } from '../../../middleware/validate.middleware.js';
import { authRateLimiter, publicGuestRateLimiter } from '../../../middleware/rateLimit.middleware.js';
import {
  publicSlugParamSchema,
  accessTokenQuerySchema,
  submitRsvpSchema,
  updateRsvpSchema,
} from '../../../validators/rsvp.validator.js';
import * as rsvpController from '../../../controllers/rsvp.controller.js';
import * as invitationController from '../../../controllers/invitation.controller.js';
import * as templateController from '../../../controllers/template.controller.js';

const router = Router();

router.get('/templates', asyncHandler(templateController.list));

// Public invitation page (with optional guest token)
router.get(
  '/invitations/:slug/page',
  validate(publicSlugParamSchema, 'params'),
  asyncHandler(rsvpController.getPublicPage),
);

// Legacy public invitation endpoint
router.get(
  '/invitations/:slug',
  validate(publicSlugParamSchema, 'params'),
  asyncHandler(invitationController.getPublic),
);

// Guest RSVP flow
router.get(
  '/invitations/:slug/qr',
  publicGuestRateLimiter,
  validateMultiple({ params: publicSlugParamSchema, query: accessTokenQuerySchema }),
  asyncHandler(rsvpController.getPublicGuestQr),
);

router.get(
  '/invitations/:slug/rsvp',
  publicGuestRateLimiter,
  validateMultiple({ params: publicSlugParamSchema, query: accessTokenQuerySchema }),
  asyncHandler(rsvpController.getGuestRsvp),
);

router.post(
  '/invitations/:slug/rsvp',
  authRateLimiter,
  validateMultiple({ params: publicSlugParamSchema, body: submitRsvpSchema }),
  asyncHandler(rsvpController.submitRsvp),
);

router.patch(
  '/invitations/:slug/rsvp',
  authRateLimiter,
  validateMultiple({ params: publicSlugParamSchema, body: updateRsvpSchema }),
  asyncHandler(rsvpController.updateGuestRsvp),
);

export default router;
