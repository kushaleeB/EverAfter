import prisma from '../lib/prisma.js';
import { generateAccessToken } from '../lib/tokens.js';

const GUEST_INCLUDE = {
  rsvps: {
    include: {
      invitation: {
        select: { id: true, slug: true, headline: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  },
};

export class GuestRepository {
  constructor(db = prisma) {
    this.db = db;
  }

  buildWhere(eventId, { category, search, rsvpStatus, invitationId } = {}) {
    const where = { eventId, deletedAt: null };
    const and = [];

    if (category) {
      where.category = category;
    }

    if (search?.trim()) {
      const term = search.trim();
      and.push({
        OR: [
          { firstName: { contains: term, mode: 'insensitive' } },
          { lastName: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
          { notes: { contains: term, mode: 'insensitive' } },
        ],
      });
    }

    if (rsvpStatus) {
      if (rsvpStatus === 'pending') {
        if (invitationId) {
          and.push({
            OR: [
              { rsvps: { none: { invitationId } } },
              { rsvps: { some: { invitationId, status: 'pending' } } },
            ],
          });
        } else {
          and.push({
            OR: [
              { rsvps: { none: {} } },
              { rsvps: { every: { status: 'pending' } } },
            ],
          });
        }
      } else if (invitationId) {
        and.push({ rsvps: { some: { invitationId, status: rsvpStatus } } });
      } else {
        and.push({ rsvps: { some: { status: rsvpStatus } } });
      }
    }

    if (and.length) where.AND = and;

    return where;
  }

  async findManyPaginated({ where, orderBy, skip, take }) {
    const [items, total] = await Promise.all([
      this.db.guest.findMany({
        where,
        include: GUEST_INCLUDE,
        orderBy,
        skip,
        take,
      }),
      this.db.guest.count({ where }),
    ]);

    return { items, total };
  }

  async findById(guestId, eventId) {
    return this.db.guest.findFirst({
      where: { id: guestId, eventId, deletedAt: null },
      include: GUEST_INCLUDE,
    });
  }

  async create(data) {
    return this.db.guest.create({
      data: {
        ...data,
        accessToken: data.accessToken ?? generateAccessToken(),
      },
      include: GUEST_INCLUDE,
    });
  }

  async createMany(eventId, guests) {
    const data = guests.map((g) => ({
      eventId,
      firstName: g.firstName,
      lastName: g.lastName,
      email: g.email,
      partySize: g.partySize,
      category: g.category,
      plusOneAllowed: g.plusOneAllowed,
      notes: g.notes,
      accessToken: generateAccessToken(),
    }));

    return this.db.guest.createManyAndReturn({ data });
  }

  async update(guestId, data) {
    return this.db.guest.update({
      where: { id: guestId },
      data,
      include: GUEST_INCLUDE,
    });
  }

  async findManyByIds(eventId, guestIds) {
    return this.db.guest.findMany({
      where: { eventId, deletedAt: null, id: { in: guestIds } },
      include: GUEST_INCLUDE,
    });
  }

  async markInviteSent(guestId) {
    const now = new Date();
    return this.db.guest.update({
      where: { id: guestId },
      data: {
        inviteSentAt: now,
        inviteStatus: 'sent',
      },
      include: GUEST_INCLUDE,
    });
  }

  async recordInviteOpened(guestId) {
    const guest = await this.db.guest.findUnique({ where: { id: guestId } });
    if (!guest || guest.inviteStatus === 'responded') return guest;

    const now = new Date();
    return this.db.guest.update({
      where: { id: guestId },
      data: {
        inviteOpenedAt: guest.inviteOpenedAt ?? now,
        inviteStatus: guest.inviteStatus === 'responded' ? 'responded' : 'opened',
      },
    });
  }

  async recordInviteResponded(guestId, respondedAt = new Date()) {
    const guest = await this.db.guest.findUnique({ where: { id: guestId } });
    return this.db.guest.update({
      where: { id: guestId },
      data: {
        respondedAt,
        inviteStatus: 'responded',
        inviteOpenedAt: guest?.inviteOpenedAt ?? respondedAt,
      },
    });
  }

  async getInviteAnalytics(eventId) {
    const groups = await this.db.guest.groupBy({
      by: ['inviteStatus'],
      where: { eventId, deletedAt: null },
      _count: { id: true },
    });

    const stats = {
      total: 0,
      not_sent: 0,
      sent: 0,
      opened: 0,
      responded: 0,
    };

    for (const group of groups) {
      stats[group.inviteStatus] = group._count.id;
      stats.total += group._count.id;
    }

    return stats;
  }

  async softDelete(guestId) {
    return this.db.guest.update({
      where: { id: guestId },
      data: { deletedAt: new Date() },
    });
  }

  async countByEvent(eventId) {
    return this.db.guest.count({ where: { eventId, deletedAt: null } });
  }

  async countByCategory(eventId) {
    const groups = await this.db.guest.groupBy({
      by: ['category'],
      where: { eventId, deletedAt: null },
      _count: { id: true },
    });

    return groups.reduce((acc, g) => {
      acc[g.category] = g._count.id;
      return acc;
    }, {});
  }

  async getRsvpsForEvent(eventId) {
    return this.db.rsvp.findMany({
      where: {
        invitation: { eventId, deletedAt: null },
        guest: { deletedAt: null },
      },
      include: {
        guest: { select: { id: true, category: true, partySize: true } },
      },
    });
  }

  async findPublishedInvitation(eventId, invitationId = null) {
    if (invitationId) {
      return this.db.invitation.findFirst({
        where: { id: invitationId, eventId, status: 'published', deletedAt: null },
      });
    }
    return this.db.invitation.findFirst({
      where: { eventId, status: 'published', deletedAt: null },
      orderBy: { publishedAt: 'desc' },
    });
  }
}

export default new GuestRepository();
