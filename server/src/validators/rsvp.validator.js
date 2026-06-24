import { z } from 'zod';

const rsvpStatusEnum = z.enum(['attending', 'declined', 'maybe']);

export const accessTokenQuerySchema = z.object({
  accessToken: z.string().min(1),
});

export const publicPageQuerySchema = z.object({
  token: z.string().min(1).optional(),
  accessToken: z.string().min(1).optional(),
}).refine((d) => d.token || d.accessToken, {
  message: 'token or accessToken is required for guest context',
});

export const submitRsvpSchema = z.object({
  accessToken: z.string().min(1),
  status: rsvpStatusEnum,
  attendingCount: z.number().int().min(0).max(20).default(0),
  dietaryNotes: z.string().max(500).optional(),
  message: z.string().max(1000).optional(),
});

export const updateRsvpSchema = z.object({
  accessToken: z.string().min(1),
  status: rsvpStatusEnum.optional(),
  attendingCount: z.number().int().min(0).max(20).optional(),
  dietaryNotes: z.string().max(500).optional(),
  message: z.string().max(1000).optional(),
});

export const hostUpdateRsvpSchema = z.object({
  status: z.enum(['pending', 'attending', 'declined', 'maybe']),
  attendingCount: z.number().int().min(0).max(20).optional(),
  dietaryNotes: z.string().max(500).optional(),
  message: z.string().max(1000).optional(),
});

export const listRsvpsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(['pending', 'attending', 'declined', 'maybe']).optional(),
  invitationId: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['respondedAt', 'createdAt', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const rsvpIdParamSchema = z.object({
  rsvpId: z.string().uuid(),
});

export const invitationIdParamSchema = z.object({
  invitationId: z.string().uuid(),
});

export const publicSlugParamSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
});
