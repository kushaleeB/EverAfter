import prisma from '../lib/prisma.js';

const RSVP_INCLUDE = {
  guest: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      category: true,
      partySize: true,
      plusOneAllowed: true,
    },
  },
  invitation: {
    select: {
      id: true,
      slug: true,
      headline: true,
      eventId: true,
    },
  },
};

const PUBLIC_INVITATION_INCLUDE = {
  sections: {
    where: { deletedAt: null, isVisible: true },
    orderBy: { sortOrder: 'asc' },
  },
  event: {
    select: {
      partnerOne: true,
      partnerTwo: true,
      eventDate: true,
      eventTimezone: true,
      venueName: true,
      venueAddress: true,
      coverImageUrl: true,
    },
  },
};

export class RsvpRepository {
  constructor(db = prisma) {
    this.db = db;
  }

  buildWhere(eventId, { status, invitationId, search } = {}) {
    const where = {
      invitation: { eventId, deletedAt: null },
      guest: { deletedAt: null },
    };

    if (status) where.status = status;
    if (invitationId) where.invitationId = invitationId;

    if (search?.trim()) {
      const term = search.trim();
      where.guest = {
        ...where.guest,
        OR: [
          { firstName: { contains: term, mode: 'insensitive' } },
          { lastName: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
        ],
      };
    }

    return where;
  }

  async findPublishedInvitation(slug) {
    return this.db.invitation.findFirst({
      where: { slug, status: 'published', deletedAt: null },
      include: PUBLIC_INVITATION_INCLUDE,
    });
  }

  async findGuestByToken(eventId, accessToken) {
    return this.db.guest.findFirst({
      where: { eventId, accessToken, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        partySize: true,
        plusOneAllowed: true,
        category: true,
      },
    });
  }

  async findGuestByIdForEvent(eventId, guestId) {
    return this.db.guest.findFirst({
      where: { id: guestId, eventId, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        partySize: true,
        plusOneAllowed: true,
        category: true,
        accessToken: true,
      },
    });
  }

  async searchGuestsForEvent(eventId, search = '') {
    const where = { eventId, deletedAt: null };
    const term = search?.trim();

    if (term) {
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }

    return this.db.guest.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        partySize: true,
        plusOneAllowed: true,
        category: true,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      take: term ? 20 : 50,
    });
  }

  async findByGuestAndInvitation(guestId, invitationId) {
    return this.db.rsvp.findUnique({
      where: { guestId_invitationId: { guestId, invitationId } },
    });
  }

  async findById(rsvpId, eventId = null) {
    const where = { id: rsvpId };
    if (eventId) {
      where.invitation = { eventId };
    }

    return this.db.rsvp.findFirst({
      where,
      include: RSVP_INCLUDE,
    });
  }

  async findManyPaginated({ where, orderBy, skip, take }) {
    const [items, total] = await Promise.all([
      this.db.rsvp.findMany({
        where,
        include: RSVP_INCLUDE,
        orderBy,
        skip,
        take,
      }),
      this.db.rsvp.count({ where }),
    ]);

    return { items, total };
  }

  async upsert(guestId, invitationId, data) {
    return this.db.rsvp.upsert({
      where: { guestId_invitationId: { guestId, invitationId } },
      create: { guestId, invitationId, ...data },
      update: data,
      include: {
        guest: {
          select: { id: true, firstName: true, lastName: true, partySize: true },
        },
      },
    });
  }

  async update(rsvpId, data) {
    return this.db.rsvp.update({
      where: { id: rsvpId },
      data,
      include: RSVP_INCLUDE,
    });
  }

  async incrementViewCount(invitationId) {
    return this.db.invitation.update({
      where: { id: invitationId },
      data: { viewCount: { increment: 1 } },
    });
  }

  async getAnalyticsForEvent(eventId) {
    const rsvps = await this.db.rsvp.findMany({
      where: {
        invitation: { eventId, deletedAt: null },
        guest: { deletedAt: null },
      },
      include: {
        guest: { select: { category: true, partySize: true } },
        invitation: { select: { id: true, slug: true, headline: true } },
      },
      orderBy: { respondedAt: 'desc' },
    });

    const totalGuests = await this.db.guest.count({
      where: { eventId, deletedAt: null },
    });

    return { rsvps, totalGuests };
  }

  async getAnalyticsForInvitation(invitationId, eventId) {
    const rsvps = await this.db.rsvp.findMany({
      where: {
        invitationId,
        invitation: { eventId, deletedAt: null },
        guest: { deletedAt: null },
      },
      include: {
        guest: {
          select: { id: true, firstName: true, lastName: true, category: true, partySize: true },
        },
      },
      orderBy: { respondedAt: 'desc' },
    });

    const totalGuests = await this.db.guest.count({
      where: { eventId, deletedAt: null },
    });

    return { rsvps, totalGuests };
  }

  async getMessages(eventId, invitationId = null) {
    const where = {
      invitation: { eventId, deletedAt: null },
      guest: { deletedAt: null },
      message: { not: null },
      NOT: { message: '' },
    };
    if (invitationId) where.invitationId = invitationId;

    return this.db.rsvp.findMany({
      where,
      select: {
        id: true,
        message: true,
        status: true,
        respondedAt: true,
        guest: { select: { firstName: true, lastName: true } },
      },
      orderBy: { respondedAt: 'desc' },
      take: 50,
    });
  }
}

export default new RsvpRepository();
