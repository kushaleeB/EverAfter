import prisma from '../lib/prisma.js';
import invitationRepository from '../repositories/invitation.repository.js';
import sectionRepository from '../repositories/invitation-section.repository.js';
import { parsePagination, buildPaginationMeta, parseSort } from '../utils/pagination.js';
import { serializeInvitation } from '../utils/serialize.js';
import { AppError } from '../errors/AppError.js';

const SORTABLE_FIELDS = ['createdAt', 'updatedAt', 'publishedAt', 'headline', 'viewCount'];

export class InvitationService {
  constructor(invitationRepo = invitationRepository, sectionRepo = sectionRepository) {
    this.invitationRepo = invitationRepo;
    this.sectionRepo = sectionRepo;
  }

  async list(eventId, query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const orderBy = parseSort(query, SORTABLE_FIELDS, 'createdAt');

    const where = this.invitationRepo.buildWhere(eventId, {
      status: query.status,
      search: query.search || query.q,
      templateId: query.templateId,
    });

    const { items, total } = await this.invitationRepo.findManyPaginated(eventId, {
      where,
      orderBy,
      skip,
      take: limit,
    });

    return {
      items: serializeInvitation(items),
      meta: buildPaginationMeta({ page, limit, total }),
    };
  }

  async getById(eventId, invitationId) {
    const invitation = await this.invitationRepo.findById(invitationId, eventId);
    if (!invitation) throw AppError.notFound('Invitation');
    return serializeInvitation(invitation);
  }

  async getPublicBySlug(slug) {
    const invitation = await this.invitationRepo.findBySlug(slug, { publishedOnly: true });
    if (!invitation) throw AppError.notFound('Invitation');

    await this.invitationRepo.incrementViewCount(invitation.id);
    return serializeInvitation(invitation);
  }

  async create(eventId, data) {
    if (await this.invitationRepo.slugExists(data.slug)) {
      throw AppError.conflict('Slug is already taken');
    }

    let themeConfig = data.themeConfig ?? {};
    let sectionsToCreate = data.sections ?? [];

    if (data.templateId) {
      const template = await prisma.invitationTemplate.findFirst({
        where: { id: data.templateId, isActive: true },
      });
      if (!template) throw AppError.notFound('Template');

      themeConfig = { ...(template.themeConfig ?? {}), ...themeConfig };

      if (!sectionsToCreate.length && template.defaultSections) {
        const defaults = Array.isArray(template.defaultSections) ? template.defaultSections : [];
        sectionsToCreate = defaults.map((s, i) => ({
          sectionType: s.sectionType,
          sortOrder: s.sortOrder ?? i,
          content: s.content ?? {},
          isVisible: s.isVisible ?? true,
        }));
      }
    }

    const invitation = await this.invitationRepo.create({
      eventId,
      templateId: data.templateId,
      slug: data.slug,
      headline: data.headline,
      subheadline: data.subheadline,
      bodyContent: data.bodyContent,
      themeConfig,
      rsvpDeadline: data.rsvpDeadline ? new Date(data.rsvpDeadline) : undefined,
      passwordProtected: data.passwordProtected ?? false,
      sections: sectionsToCreate.length
        ? { create: sectionsToCreate }
        : undefined,
    });

    return serializeInvitation(invitation);
  }

  async update(eventId, invitationId, data) {
    const existing = await this.invitationRepo.findById(invitationId, eventId);
    if (!existing) throw AppError.notFound('Invitation');

    if (data.slug && data.slug !== existing.slug) {
      if (await this.invitationRepo.slugExists(data.slug, invitationId)) {
        throw AppError.conflict('Slug is already taken');
      }
    }

    if (existing.status === 'published' && data.status === 'draft') {
      throw AppError.badRequest('Cannot revert a published invitation to draft. Use archive instead.');
    }

    const updateData = { ...data };
    if (data.rsvpDeadline !== undefined) {
      updateData.rsvpDeadline = data.rsvpDeadline ? new Date(data.rsvpDeadline) : null;
    }

    const invitation = await this.invitationRepo.update(invitationId, updateData);
    return serializeInvitation(invitation);
  }

  async publish(eventId, invitationId) {
    const invitation = await this.invitationRepo.findById(invitationId, eventId);
    if (!invitation) throw AppError.notFound('Invitation');

    if (invitation.status === 'published') {
      throw AppError.conflict('Invitation is already published');
    }

    if (invitation.status === 'archived') {
      throw AppError.badRequest('Cannot publish an archived invitation');
    }

    const updated = await this.invitationRepo.update(invitationId, {
      status: 'published',
      publishedAt: new Date(),
    });

    return serializeInvitation(updated);
  }

  async archive(eventId, invitationId) {
    const invitation = await this.invitationRepo.findById(invitationId, eventId);
    if (!invitation) throw AppError.notFound('Invitation');

    const updated = await this.invitationRepo.update(invitationId, {
      status: 'archived',
    });

    return serializeInvitation(updated);
  }

  async remove(eventId, invitationId) {
    const invitation = await this.invitationRepo.findById(invitationId, eventId);
    if (!invitation) throw AppError.notFound('Invitation');

    await this.invitationRepo.softDelete(invitationId);
  }

  // ─── Sections ──────────────────────────────────────────────────────────────

  async listSections(eventId, invitationId) {
    await this.getById(eventId, invitationId);
    return this.sectionRepo.findByInvitation(invitationId);
  }

  async createSection(eventId, invitationId, data) {
    await this.getById(eventId, invitationId);

    const sortOrder = data.sortOrder ?? await this.sectionRepo.getNextSortOrder(invitationId);

    return this.sectionRepo.create({
      invitationId,
      sectionType: data.sectionType,
      sortOrder,
      content: data.content ?? {},
      isVisible: data.isVisible ?? true,
    });
  }

  async updateSection(eventId, invitationId, sectionId, data) {
    const section = await this.sectionRepo.findById(sectionId, invitationId);
    if (!section) throw AppError.notFound('Section');

    await this.getById(eventId, invitationId);

    return this.sectionRepo.update(sectionId, data);
  }

  async removeSection(eventId, invitationId, sectionId) {
    const section = await this.sectionRepo.findById(sectionId, invitationId);
    if (!section) throw AppError.notFound('Section');

    await this.getById(eventId, invitationId);
    await this.sectionRepo.softDelete(sectionId);
  }

  async reorderSections(eventId, invitationId, orderedIds) {
    await this.getById(eventId, invitationId);
    await this.sectionRepo.reorder(invitationId, orderedIds);
    return this.sectionRepo.findByInvitation(invitationId);
  }
}

export default new InvitationService();
