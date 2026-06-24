import rsvpRepository from '../repositories/rsvp.repository.js';
import { serializeInvitation } from '../utils/serialize.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { AppError } from '../errors/AppError.js';

function validateAttendingCount(status, attendingCount, partySize) {
  if (status === 'attending' && attendingCount < 1) {
    throw AppError.badRequest('attendingCount must be at least 1 when attending');
  }
  if (status !== 'attending' && attendingCount > 0) {
    throw AppError.badRequest('attendingCount must be 0 unless status is attending');
  }
  if (attendingCount > partySize) {
    throw AppError.badRequest(`attendingCount cannot exceed party size of ${partySize}`);
  }
}

function buildAnalytics(rsvps, totalGuests) {
  const byStatus = { pending: 0, attending: 0, declined: 0, maybe: 0 };
  const byCategory = {};
  const timeline = {};
  const dietaryNotes = [];
  let totalAttendingCount = 0;

  for (const rsvp of rsvps) {
    byStatus[rsvp.status] = (byStatus[rsvp.status] || 0) + 1;

    if (rsvp.status === 'attending') {
      totalAttendingCount += rsvp.attendingCount;
    }

    const cat = rsvp.guest?.category ?? 'other';
    if (!byCategory[cat]) {
      byCategory[cat] = { attending: 0, declined: 0, maybe: 0, pending: 0 };
    }
    byCategory[cat][rsvp.status]++;

    if (rsvp.respondedAt) {
      const day = rsvp.respondedAt.toISOString().slice(0, 10);
      timeline[day] = (timeline[day] || 0) + 1;
    }

    if (rsvp.dietaryNotes?.trim()) {
      dietaryNotes.push({
        guest: rsvp.guest
          ? `${rsvp.guest.firstName} ${rsvp.guest.lastName}`
          : 'Unknown',
        notes: rsvp.dietaryNotes,
      });
    }
  }

  const guestsResponded = new Set(
    rsvps.filter((r) => r.respondedAt).map((r) => r.guestId),
  ).size;

  const guestsPending = Math.max(0, totalGuests - guestsResponded);

  return {
    summary: {
      totalGuests,
      guestsResponded,
      guestsPending,
      responseRate: totalGuests ? Math.round((guestsResponded / totalGuests) * 100) : 0,
      totalAttendingCount,
      totalRsvpRecords: rsvps.length,
    },
    byStatus,
    byCategory,
    timeline: Object.entries(timeline)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    dietaryNotes,
  };
}

export class RsvpService {
  constructor(repo = rsvpRepository) {
    this.repo = repo;
  }

  // ─── Public: Invitation Page ───────────────────────────────────────────────

  async getPublicPage(slug, accessToken = null) {
    const invitation = await this.repo.findPublishedInvitation(slug);
    if (!invitation) throw AppError.notFound('Invitation');

    await this.repo.incrementViewCount(invitation.id);

    const page = {
      invitation: serializeInvitation({
        id: invitation.id,
        slug: invitation.slug,
        headline: invitation.headline,
        subheadline: invitation.subheadline,
        bodyContent: invitation.bodyContent,
        themeConfig: invitation.themeConfig,
        rsvpDeadline: invitation.rsvpDeadline,
        publishedAt: invitation.publishedAt,
        sections: invitation.sections,
        event: invitation.event,
      }),
      guest: null,
      rsvp: null,
    };

    if (accessToken) {
      const guest = await this.repo.findGuestByToken(invitation.eventId, accessToken);
      if (!guest) throw AppError.unauthorized('Invalid guest access token');

      page.guest = guest;
      page.rsvp = await this.repo.findByGuestAndInvitation(guest.id, invitation.id);
    }

    return page;
  }

  // ─── Public: Guest RSVP ────────────────────────────────────────────────────

  async _resolveGuestAndInvitation(slug, accessToken) {
    const invitation = await this.repo.findPublishedInvitation(slug);
    if (!invitation) throw AppError.notFound('Invitation');

    const guest = await this.repo.findGuestByToken(invitation.eventId, accessToken);
    if (!guest) throw AppError.unauthorized('Invalid guest access token');

    return { invitation, guest };
  }

  async getGuestRsvp(slug, accessToken) {
    const { invitation, guest } = await this._resolveGuestAndInvitation(slug, accessToken);

    const rsvp = await this.repo.findByGuestAndInvitation(guest.id, invitation.id);

    return {
      guest,
      rsvp: rsvp ?? { status: 'pending', attendingCount: 0 },
      invitation: { id: invitation.id, slug: invitation.slug, rsvpDeadline: invitation.rsvpDeadline },
    };
  }

  async submitRsvp(slug, data, meta = {}) {
    const { invitation, guest } = await this._resolveGuestAndInvitation(slug, data.accessToken);

    if (invitation.rsvpDeadline && new Date() > new Date(invitation.rsvpDeadline)) {
      throw AppError.badRequest('RSVP deadline has passed');
    }

    validateAttendingCount(data.status, data.attendingCount, guest.partySize);

    const rsvp = await this.repo.upsert(guest.id, invitation.id, {
      status: data.status,
      attendingCount: data.status === 'attending' ? data.attendingCount : 0,
      dietaryNotes: data.dietaryNotes,
      message: data.message,
      respondedAt: new Date(),
      ipAddress: meta.ipAddress,
    });

    return {
      rsvp,
      message: 'Thank you! Your RSVP has been recorded.',
    };
  }

  async updateGuestRsvp(slug, data, meta = {}) {
    const { invitation, guest } = await this._resolveGuestAndInvitation(slug, data.accessToken);

    const existing = await this.repo.findByGuestAndInvitation(guest.id, invitation.id);
    if (!existing?.respondedAt) {
      throw AppError.badRequest('No existing RSVP found. Please submit first.');
    }

    if (invitation.rsvpDeadline && new Date() > new Date(invitation.rsvpDeadline)) {
      throw AppError.badRequest('RSVP deadline has passed');
    }

    const status = data.status ?? existing.status;
    const attendingCount = data.attendingCount ?? existing.attendingCount;

    validateAttendingCount(status, attendingCount, guest.partySize);

    const rsvp = await this.repo.upsert(guest.id, invitation.id, {
      status,
      attendingCount: status === 'attending' ? attendingCount : 0,
      dietaryNotes: data.dietaryNotes ?? existing.dietaryNotes,
      message: data.message ?? existing.message,
      respondedAt: new Date(),
      ipAddress: meta.ipAddress ?? existing.ipAddress,
    });

    return {
      rsvp,
      message: 'Your RSVP has been updated.',
    };
  }

  // ─── Authenticated: Host / Planner ─────────────────────────────────────────

  async listForEvent(eventId, query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const sortField = ['respondedAt', 'createdAt', 'status'].includes(query.sortBy)
      ? query.sortBy
      : 'respondedAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const where = this.repo.buildWhere(eventId, {
      status: query.status,
      invitationId: query.invitationId,
      search: query.search,
    });

    const { items, total } = await this.repo.findManyPaginated({
      where,
      orderBy: { [sortField]: sortOrder },
      skip,
      take: limit,
    });

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total }),
    };
  }

  async updateByHost(eventId, rsvpId, data) {
    const rsvp = await this.repo.findById(rsvpId, eventId);
    if (!rsvp) throw AppError.notFound('RSVP');

    const attendingCount =
      data.attendingCount ??
      (data.status === 'attending' ? rsvp.attendingCount : 0);

    if (data.status === 'attending' && attendingCount < 1) {
      throw AppError.badRequest('attendingCount must be at least 1 when attending');
    }

    const updated = await this.repo.update(rsvpId, {
      status: data.status,
      attendingCount: data.status === 'attending' ? attendingCount : 0,
      dietaryNotes: data.dietaryNotes,
      message: data.message,
      respondedAt: data.status === 'pending' ? null : (rsvp.respondedAt ?? new Date()),
    });

    return updated;
  }

  async getEventAnalytics(eventId) {
    const { rsvps, totalGuests } = await this.repo.getAnalyticsForEvent(eventId);
    const messages = await this.repo.getMessages(eventId);

    return {
      ...buildAnalytics(rsvps, totalGuests),
      recentMessages: messages,
    };
  }

  async getInvitationAnalytics(eventId, invitationId) {
    const { rsvps, totalGuests } = await this.repo.getAnalyticsForInvitation(
      invitationId,
      eventId,
    );
    const messages = await this.repo.getMessages(eventId, invitationId);

    return {
      invitationId,
      ...buildAnalytics(rsvps, totalGuests),
      recentMessages: messages,
    };
  }
}

export default new RsvpService();
