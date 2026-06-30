import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import * as dashboardController from '../../../controllers/dashboard.controller.js';

const router = Router();

router.use(authenticate);

router.get('/summary', asyncHandler(dashboardController.summary));

export default router;
