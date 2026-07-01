import guestRepository from '../repositories/guest.repository.js';
import invitationSendService from './invitation-send.service.js';
import { parseGuestCsv, GUEST_CATEGORY_LABELS } from '../lib/csv.js';
import { generateGuestQrResult } from '../lib/guestQr.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { AppError } from '../errors/AppError.js';

const SORTABLE_FIELDS = ['lastName', 'firstName', 'createdAt', 'category', 'inviteSentAt'];

function resolveRsvpStatus(rsvps) {
  if (!rsvps?.length) return 'pending';

  const responded = rsvps.filter((r) => r.respondedAt);
  if (!responded.length) return 'pending';

  const latest = responded.sort(
    (a, b) => new Date(b.respondedAt) - new Date(a.respondedAt),
  )[0];

  return latest.status;
}

function enrichGuest(guest) {
  const rsvpStatus = resolveRsvpStatus(guest.rsvps);
  const latestRsvp = guest.rsvps?.[0] ?? null;
  const inviteStatus =
    guest.respondedAt || latestRsvp?.respondedAt
      ? 'responded'
      : guest.inviteStatus ?? (guest.inviteSentAt ? 'sent' : 'not_sent');

  return {
    ...guest,
    inviteStatus,
    rsvpStatus,
    latestRsvp: latestRsvp
      ? {
          id: latestRsvp.id,
          status: latestRsvp.status,
          attendingCount: latestRsvp.attendingCount,
          respondedAt: latestRsvp.respondedAt,
          invitation: latestRsvp.invitation,
        }
      : null,
  };
}

export class GuestService {
  constructor(repo = guestRepository) {
    this.repo = repo;
  }

  async list(eventId, query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const sortField = SORTABLE_FIELDS.includes(query.sortBy) ? query.sortBy : 'lastName';
    const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';

    const orderBy =
      sortField === 'lastName'
        ? [{ lastName: sortOrder }, { firstName: sortOrder }]
        : { [sortField]: sortOrder };

    const where = this.repo.buildWhere(eventId, {
      category: query.category,
      search: query.search || query.q,
      rsvpStatus: query.rsvpStatus,
      invitationId: query.invitationId,
    });

    const { items, total } = await this.repo.findManyPaginated({
      where,
      orderBy,
      skip,
      take: limit,
    });

    return {
      items: items.map(enrichGuest),
      meta: buildPaginationMeta({ page, limit, total }),
    };
  }

  async getById(eventId, guestId) {
    const guest = await this.repo.findById(guestId, eventId);
    if (!guest) throw AppError.notFound('Guest');
    return enrichGuest(guest);
  }

  async create(eventId, data) {
    const guest = await this.repo.create({ ...data, eventId });
    return enrichGuest(guest);
  }

  async update(eventId, guestId, data) {
    const existing = await this.repo.findById(guestId, eventId);
    if (!existing) throw AppError.notFound('Guest');

    const guest = await this.repo.update(guestId, data);
    return enrichGuest(guest);
  }

  async remove(eventId, guestId) {
    const existing = await this.repo.findById(guestId, eventId);
    if (!existing) throw AppError.notFound('Guest');
    await this.repo.softDelete(guestId);
  }

  async importCsv(eventId, buffer) {
    const rows = parseGuestCsv(buffer);
    const created = await this.repo.createMany(eventId, rows);

    return {
      imported: created.length,
      guests: created.map((g) => ({
        id: g.id,
        firstName: g.firstName,
        lastName: g.lastName,
        email: g.email,
        category: g.category,
      })),
    };
  }

  getCategories() {
    return Object.entries(GUEST_CATEGORY_LABELS).map(([value, label]) => ({
      value,
      label,
    }));
  }

  async getRsvpSummary(eventId) {
    const rsvps = await this.repo.getRsvpsForEvent(eventId);
    const guestCount = await this.repo.countByEvent(eventId);
    const byCategory = await this.repo.countByCategory(eventId);

    const statusCounts = {
      pending: 0,
      attending: 0,
      declined: 0,
      maybe: 0,
    };

    const rsvpByCategory = {};

    for (const rsvp of rsvps) {
      statusCounts[rsvp.status] = (statusCounts[rsvp.status] || 0) + 1;

      const cat = rsvp.guest?.category ?? 'other';
      if (!rsvpByCategory[cat]) {
        rsvpByCategory[cat] = { attending: 0, declined: 0, maybe: 0, pending: 0 };
      }
      rsvpByCategory[cat][rsvp.status]++;
    }

    const guestsWithRsvp = new Set(rsvps.map((r) => r.guestId)).size;
    const guestsWithoutRsvp = Math.max(0, guestCount - guestsWithRsvp);

    return {
      totalGuests: guestCount,
      guestsWithRsvp,
      guestsWithoutRsvp,
      rsvpResponses: rsvps.length,
      byStatus: statusCounts,
      byCategory: rsvpByCategory,
      guestCountByCategory: byCategory,
      totalAttendingCount: rsvps
        .filter((r) => r.status === 'attending')
        .reduce((sum, r) => sum + r.attendingCount, 0),
      responseRate: guestCount
        ? Math.round((guestsWithRsvp / guestCount) * 100)
        : 0,
    };
  }

  async getRsvpTracking(eventId, query = {}) {
    const result = await this.list(eventId, { ...query, limit: query.limit ?? 100 });
    return {
      guests: result.items.map((g) => ({
        id: g.id,
        firstName: g.firstName,
        lastName: g.lastName,
        email: g.email,
        category: g.category,
        partySize: g.partySize,
        rsvpStatus: g.rsvpStatus,
        latestRsvp: g.latestRsvp,
        inviteSentAt: g.inviteSentAt,
        inviteStatus: g.inviteStatus,
        inviteOpenedAt: g.inviteOpenedAt,
        respondedAt: g.respondedAt,
      })),
      meta: result.meta,
    };
  }

  async generateQr(eventId, guestId, { invitationId, format = 'dataurl' } = {}) {
    const guest = await this.repo.findById(guestId, eventId);
    if (!guest) throw AppError.notFound('Guest');

    const invitation = await this.repo.findPublishedInvitation(eventId, invitationId);
    if (!invitation) {
      throw AppError.badRequest('No published invitation found for this event');
    }

    return generateGuestQrResult(guest, invitation, format);
  }

  async markInviteSent(eventId, guestId) {
    const guest = await this.repo.findById(guestId, eventId);
    if (!guest) throw AppError.notFound('Guest');

    const updated = await this.repo.markInviteSent(guestId);
    return enrichGuest(updated);
  }

  async sendInvitation(eventId, guestId, options = {}) {
    const result = await invitationSendService.sendToGuest(eventId, guestId, options);
    const guest = await this.getById(eventId, guestId);
    return { ...result, guest };
  }

  async sendBulkInvitations(eventId, body) {
    return invitationSendService.sendBulk(eventId, body);
  }

  async getInvitationAnalytics(eventId) {
    return invitationSendService.getInvitationAnalytics(eventId);
  }
}

export default new GuestService();
