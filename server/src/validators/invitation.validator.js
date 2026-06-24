import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const invitationStatusEnum = z.enum(['draft', 'published', 'archived']);
const sectionTypeEnum = z.enum(['hero', 'story', 'schedule', 'gallery', 'rsvp', 'registry', 'custom']);

// ─── Query (list / filter / search / pagination) ─────────────────────────────

export const listInvitationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: invitationStatusEnum.optional(),
  templateId: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
  q: z.string().max(200).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'publishedAt', 'headline', 'viewCount']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// ─── Body schemas ────────────────────────────────────────────────────────────

export const createInvitationSchema = z.object({
  templateId: z.string().uuid().optional(),
  slug: z.string().regex(slugRegex, 'Slug must be lowercase alphanumeric with hyphens').max(100),
  headline: z.string().max(255).optional(),
  subheadline: z.string().max(2000).optional(),
  bodyContent: z.string().max(10000).optional(),
  themeConfig: z.record(z.unknown()).optional(),
  rsvpDeadline: z.string().date().optional(),
  passwordProtected: z.boolean().optional(),
  sections: z
    .array(
      z.object({
        sectionType: sectionTypeEnum,
        sortOrder: z.number().int().min(0).optional(),
        content: z.record(z.unknown()).optional(),
        isVisible: z.boolean().optional(),
      }),
    )
    .optional(),
});

export const updateInvitationSchema = z
  .object({
    slug: z.string().regex(slugRegex).max(100).optional(),
    headline: z.string().max(255).optional(),
    subheadline: z.string().max(2000).optional(),
    bodyContent: z.string().max(10000).optional(),
    themeConfig: z.record(z.unknown()).optional(),
    rsvpDeadline: z.string().date().nullable().optional(),
    passwordProtected: z.boolean().optional(),
    status: invitationStatusEnum.optional(),
    templateId: z.string().uuid().nullable().optional(),
  })
  .strict();

export const createSectionSchema = z.object({
  sectionType: sectionTypeEnum,
  sortOrder: z.number().int().min(0).optional(),
  content: z.record(z.unknown()).optional(),
  isVisible: z.boolean().optional(),
});

export const updateSectionSchema = z.object({
  sectionType: sectionTypeEnum.optional(),
  sortOrder: z.number().int().min(0).optional(),
  content: z.record(z.unknown()).optional(),
  isVisible: z.boolean().optional(),
});

export const reorderSectionsSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1),
});

// ─── Params ──────────────────────────────────────────────────────────────────

export const invitationIdParamSchema = z.object({
  invitationId: z.string().uuid(),
});

export const sectionIdParamSchema = z.object({
  sectionId: z.string().uuid(),
});

export const publicSlugParamSchema = z.object({
  slug: z.string().regex(slugRegex),
});
