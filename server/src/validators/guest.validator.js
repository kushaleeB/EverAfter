import { z } from 'zod';

const guestCategoryEnum = z.enum([
  'family',
  'friends',
  'colleagues',
  'vip',
  'wedding_party',
  'other',
]);

const rsvpStatusEnum = z.enum(['pending', 'attending', 'declined', 'maybe']);

export const listGuestsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  category: guestCategoryEnum.optional(),
  rsvpStatus: rsvpStatusEnum.optional(),
  invitationId: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
  q: z.string().max(200).optional(),
  sortBy: z.enum(['lastName', 'firstName', 'createdAt', 'category', 'inviteSentAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const createGuestSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  category: guestCategoryEnum.default('other'),
  partySize: z.number().int().min(1).max(20).default(1),
  plusOneAllowed: z.boolean().default(false),
  notes: z.string().max(500).optional(),
});

export const updateGuestSchema = createGuestSchema.partial();

export const guestIdParamSchema = z.object({
  guestId: z.string().uuid(),
});

export const sendInvitationBodySchema = z.object({
  channel: z.enum(['email', 'link', 'whatsapp']).default('email'),
  invitationId: z.string().uuid().optional(),
});

export const sendBulkInvitationsBodySchema = z.object({
  guestIds: z.array(z.string().uuid()).min(1).max(100),
  channel: z.enum(['email', 'link', 'whatsapp']).default('email'),
  invitationId: z.string().uuid().optional(),
});

export const guestQrQuerySchema = z.object({
  invitationId: z.string().uuid().optional(),
  format: z.enum(['dataurl', 'png']).default('dataurl'),
});
