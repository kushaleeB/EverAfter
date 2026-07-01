import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { requireEventAccess } from '../../../middleware/rbac.middleware.js';
import { validate, validateMultiple } from '../../../middleware/validate.middleware.js';
import { csvUpload, handleCsvUploadError } from '../../../middleware/csvUpload.middleware.js';
import { PERMISSIONS } from '../../../config/roles.js';
import { eventIdParamSchema } from '../../../validators/event.validator.js';
import {
  listGuestsQuerySchema,
  createGuestSchema,
  updateGuestSchema,
  guestIdParamSchema,
  guestQrQuerySchema,
  sendInvitationBodySchema,
  sendBulkInvitationsBodySchema,
} from '../../../validators/guest.validator.js';
import * as guestController from '../../../controllers/guest.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

const eventParams = eventIdParamSchema;
const guestParams = eventIdParamSchema.merge(guestIdParamSchema);

// ─── Static routes (before :guestId) ─────────────────────────────────────────

router.get(
  '/categories',
  validateMultiple({ params: eventParams }),
  requireEventAccess(PERMISSIONS.GUEST_READ),
  asyncHandler(guestController.listCategories),
);

router.get(
  '/rsvp-summary',
  validateMultiple({ params: eventParams }),
  requireEventAccess(PERMISSIONS.RSVP_READ),
  asyncHandler(guestController.rsvpSummary),
);

router.get(
  '/rsvp-tracking',
  validateMultiple({ params: eventParams, query: listGuestsQuerySchema }),
  requireEventAccess(PERMISSIONS.RSVP_READ),
  asyncHandler(guestController.rsvpTracking),
);

router.get(
  '/invitation-analytics',
  validateMultiple({ params: eventParams }),
  requireEventAccess(PERMISSIONS.RSVP_READ),
  asyncHandler(guestController.invitationAnalytics),
);

router.post(
  '/send-bulk',
  validateMultiple({ params: eventParams, body: sendBulkInvitationsBodySchema }),
  requireEventAccess(PERMISSIONS.GUEST_WRITE),
  asyncHandler(guestController.sendBulkInvitations),
);

router.post(
  '/import',
  validateMultiple({ params: eventParams }),
  requireEventAccess(PERMISSIONS.GUEST_WRITE),
  csvUpload.single('file'),
  handleCsvUploadError,
  asyncHandler(guestController.importCsv),
);

// ─── Guest CRUD ──────────────────────────────────────────────────────────────

router.get(
  '/',
  validateMultiple({ params: eventParams, query: listGuestsQuerySchema }),
  requireEventAccess(PERMISSIONS.GUEST_READ),
  asyncHandler(guestController.list),
);

router.post(
  '/',
  validateMultiple({ params: eventParams, body: createGuestSchema }),
  requireEventAccess(PERMISSIONS.GUEST_WRITE),
  asyncHandler(guestController.create),
);

router.get(
  '/:guestId',
  validateMultiple({ params: guestParams }),
  requireEventAccess(PERMISSIONS.GUEST_READ),
  asyncHandler(guestController.get),
);

router.patch(
  '/:guestId',
  validateMultiple({ params: guestParams, body: updateGuestSchema }),
  requireEventAccess(PERMISSIONS.GUEST_WRITE),
  asyncHandler(guestController.update),
);

router.delete(
  '/:guestId',
  validateMultiple({ params: guestParams }),
  requireEventAccess(PERMISSIONS.GUEST_DELETE),
  asyncHandler(guestController.remove),
);

// ─── Guest actions ───────────────────────────────────────────────────────────

router.get(
  '/:guestId/qr',
  validateMultiple({ params: guestParams, query: guestQrQuerySchema }),
  requireEventAccess(PERMISSIONS.GUEST_READ),
  asyncHandler(guestController.generateQr),
);

router.post(
  '/:guestId/send-invitation',
  validateMultiple({ params: guestParams, body: sendInvitationBodySchema }),
  requireEventAccess(PERMISSIONS.GUEST_WRITE),
  asyncHandler(guestController.sendInvitation),
);

router.post(
  '/:guestId/mark-invite-sent',
  validateMultiple({ params: guestParams }),
  requireEventAccess(PERMISSIONS.GUEST_WRITE),
  asyncHandler(guestController.markInviteSent),
);

export default router;
