import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().trim().min(1).max(255),
  partnerOne: z.string().trim().max(100).optional(),
  partnerTwo: z.string().trim().max(100).optional(),
  eventDate: z.string().date().optional(),
  eventTimezone: z.string().max(64).default('UTC'),
  venueName: z.string().trim().max(255).optional(),
  venueAddress: z.string().trim().optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const eventIdParamSchema = z.object({
  eventId: z.string().uuid(),
});
