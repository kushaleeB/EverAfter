import prisma from '../lib/prisma.js';

const DEFAULT_INCLUDE = {
  template: {
    select: {
      id: true,
      name: true,
      slug: true,
      previewImageUrl: true,
      isPremium: true,
    },
  },
  _count: {
    select: {
      sections: { where: { deletedAt: null } },
      rsvps: true,
    },
  },
};

const DETAIL_INCLUDE = {
  template: true,
  event: {
    select: {
      id: true,
      title: true,
      partnerOne: true,
      partnerTwo: true,
      eventDate: true,
    },
  },
  sections: {
    where: { deletedAt: null },
    orderBy: { sortOrder: 'asc' },
  },
  _count: {
    select: { rsvps: true },
  },
};

const PUBLIC_INCLUDE = {
  sections: {
    where: { deletedAt: null, isVisible: true },
    orderBy: { sortOrder: 'asc' },
  },
  event: {
    select: {
      partnerOne: true,
      partnerTwo: true,
      eventDate: true,
      venueName: true,
      venueAddress: true,
      coverImageUrl: true,
    },
  },
};

export class InvitationRepository {
  constructor(db = prisma) {
    this.db = db;
  }

  buildWhere(eventId, { status, search, templateId } = {}) {
    const where = { eventId, deletedAt: null };

    if (status) {
      where.status = status;
    }

    if (templateId) {
      where.templateId = templateId;
    }

    if (search?.trim()) {
      const term = search.trim();
      where.OR = [
        { headline: { contains: term, mode: 'insensitive' } },
        { subheadline: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term, mode: 'insensitive' } },
        { bodyContent: { contains: term, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  async findManyPaginated(eventId, { where, orderBy, skip, take }) {
    const [items, total] = await Promise.all([
      this.db.invitation.findMany({
        where,
        include: DEFAULT_INCLUDE,
        orderBy,
        skip,
        take,
      }),
      this.db.invitation.count({ where }),
    ]);

    return { items, total };
  }

  async findById(invitationId, eventId = null) {
    const where = { id: invitationId, deletedAt: null };
    if (eventId) where.eventId = eventId;

    return this.db.invitation.findFirst({
      where,
      include: DETAIL_INCLUDE,
    });
  }

  async findBySlug(slug, { publishedOnly = false } = {}) {
    const where = { slug, deletedAt: null };
    if (publishedOnly) where.status = 'published';

    return this.db.invitation.findFirst({
      where,
      include: publishedOnly ? PUBLIC_INCLUDE : DETAIL_INCLUDE,
    });
  }

  async slugExists(slug, excludeId = null) {
    const where = { slug, deletedAt: null };
    if (excludeId) where.id = { not: excludeId };

    const count = await this.db.invitation.count({ where });
    return count > 0;
  }

  async create(data) {
    return this.db.invitation.create({
      data,
      include: DETAIL_INCLUDE,
    });
  }

  async update(invitationId, data) {
    return this.db.invitation.update({
      where: { id: invitationId },
      data,
      include: DETAIL_INCLUDE,
    });
  }

  async softDelete(invitationId) {
    return this.db.invitation.update({
      where: { id: invitationId },
      data: { deletedAt: new Date() },
    });
  }

  async incrementViewCount(invitationId) {
    return this.db.invitation.update({
      where: { id: invitationId },
      data: { viewCount: { increment: 1 } },
    });
  }

  async countByEvent(eventId, status = null) {
    const where = { eventId, deletedAt: null };
    if (status) where.status = status;
    return this.db.invitation.count({ where });
  }
}

export default new InvitationRepository();
