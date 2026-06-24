import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { requireEventAccess } from '../../../middleware/rbac.middleware.js';
import { validateMultiple } from '../../../middleware/validate.middleware.js';
import { PERMISSIONS } from '../../../config/roles.js';
import { eventIdParamSchema } from '../../../validators/event.validator.js';
import { upload, handleMulterError } from '../../../middleware/upload.middleware.js';
import * as mediaController from '../../../controllers/media.controller.js';
import { z } from 'zod';

const mediaIdParamSchema = z.object({
  mediaId: z.string().uuid(),
});

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get(
  '/',
  validateMultiple({ params: eventIdParamSchema }),
  requireEventAccess(PERMISSIONS.MEDIA_READ),
  asyncHandler(mediaController.list),
);

router.post(
  '/',
  validateMultiple({ params: eventIdParamSchema }),
  requireEventAccess(PERMISSIONS.MEDIA_WRITE),
  upload.single('file'),
  handleMulterError,
  asyncHandler(mediaController.upload),
);

router.delete(
  '/:mediaId',
  validateMultiple({ params: eventIdParamSchema.merge(mediaIdParamSchema) }),
  requireEventAccess(PERMISSIONS.MEDIA_DELETE),
  asyncHandler(mediaController.remove),
);

export default router;
