import { Router } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import * as healthController from '../../../controllers/health.controller.js';
import authRoutes from './auth.routes.js';
import eventsRoutes from './events.routes.js';
import invitationsRoutes from './invitations.routes.js';
import guestsRoutes from './guests.routes.js';
import mediaRoutes from './media.routes.js';
import rsvpRoutes from './rsvp.routes.js';
import publicRoutes from './public.routes.js';

const router = Router();

router.get('/health', asyncHandler(healthController.health));
router.get('/health/db', asyncHandler(healthController.healthDb));

router.use('/auth', authRoutes);
router.use('/events', eventsRoutes);
router.use('/events/:eventId/invitations', invitationsRoutes);
router.use('/events/:eventId/guests', guestsRoutes);
router.use('/events/:eventId/media', mediaRoutes);
router.use('/events/:eventId/rsvps', rsvpRoutes);
router.use('/public', publicRoutes);

export default router;
