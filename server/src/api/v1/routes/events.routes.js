import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { requireEventAccess } from '../../../middleware/rbac.middleware.js';
import { validate, validateMultiple } from '../../../middleware/validate.middleware.js';
import { PERMISSIONS } from '../../../config/roles.js';
import {
  createEventSchema,
  updateEventSchema,
  eventIdParamSchema,
} from '../../../validators/event.validator.js';
import * as eventController from '../../../controllers/event.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(eventController.list));
router.post('/', validate(createEventSchema), asyncHandler(eventController.create));

router.get(
  '/:eventId',
  validateMultiple({ params: eventIdParamSchema }),
  requireEventAccess(PERMISSIONS.EVENT_READ),
  asyncHandler(eventController.get),
);

router.patch(
  '/:eventId',
  validateMultiple({ params: eventIdParamSchema, body: updateEventSchema }),
  requireEventAccess(PERMISSIONS.EVENT_WRITE),
  asyncHandler(eventController.update),
);

router.delete(
  '/:eventId',
  validateMultiple({ params: eventIdParamSchema }),
  requireEventAccess(PERMISSIONS.EVENT_DELETE),
  asyncHandler(eventController.remove),
);

export default router;
