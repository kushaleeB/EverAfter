import guestRepository from '../repositories/guest.repository.js';
import { sendGuestInvitationEmail } from './email.service.js';
import {
  buildPublicInviteUrl,
  buildWhatsAppInviteMessage,
  buildWhatsAppShareUrl,
  toApiInviteStatus,
} from '../lib/guestInviteUrl.js';
import { AppError } from '../errors/AppError.js';
import prisma from '../lib/prisma.js';

function formatGuestName(guest) {
  return `${guest.firstName} ${guest.lastName}`.trim();
}

function formatCoupleNames(invitation, event) {
  if (invitation.headline?.trim()) return invitation.headline.trim();
  const parts = [event?.partnerOne, event?.partnerTwo].filter(Boolean);
  if (parts.length) return parts.join(' & ');
  return event?.title ?? 'Our Wedding';
}

function toSendResult(guest, invitationUrl) {
  return {
    status: toApiInviteStatus(guest.inviteStatus),
    sentAt: guest.inviteSentAt,
    invitationUrl,
    inviteStatus: guest.inviteStatus,
    inviteOpenedAt: guest.inviteOpenedAt,
    respondedAt: guest.respondedAt,
    whatsappUrl: buildWhatsAppShareUrl(buildWhatsAppInviteMessage(invitationUrl)),
  };
}

export class InvitationSendService {
  constructor(repo = guestRepository) {
    this.repo = repo;
  }

  async resolveInvitation(eventId, invitationId = null) {
    const invitation = await this.repo.findPublishedInvitation(eventId, invitationId);
    if (!invitation) {
      throw AppError.badRequest('No published invitation found for this event. Publish an invitation first.');
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId, deletedAt: null },
      select: {
        title: true,
        partnerOne: true,
        partnerTwo: true,
      },
    });

    return { invitation, event };
  }

  async sendToGuest(eventId, guestId, { channel = 'email', invitationId = null } = {}) {
    const guest = await this.repo.findById(guestId, eventId);
    if (!guest) throw AppError.notFound('Guest');

    const { invitation, event } = await this.resolveInvitation(eventId, invitationId);
    const invitationUrl = buildPublicInviteUrl(invitation.slug);
    const guestName = formatGuestName(guest);
    const coupleNames = formatCoupleNames(invitation, event);

    if (channel === 'email') {
      if (!guest.email) {
        throw AppError.badRequest('This guest does not have an email address on file.');
      }
      await sendGuestInvitationEmail({
        to: guest.email,
        guestName,
        coupleNames,
        invitationUrl,
      });
    }

    const updated = await this.repo.markInviteSent(guestId);
    return toSendResult(updated, invitationUrl);
  }

  async sendBulk(eventId, { guestIds = [], channel = 'email', invitationId = null } = {}) {
    if (!guestIds.length) {
      throw AppError.badRequest('guestIds must include at least one guest.');
    }

    const results = [];
    const errors = [];

    for (const guestId of guestIds) {
      try {
        const result = await this.sendToGuest(eventId, guestId, { channel, invitationId });
        results.push({ guestId, success: true, data: result });
      } catch (err) {
        errors.push({
          guestId,
          success: false,
          message: err.message ?? 'Failed to send invitation',
        });
      }
    }

    return {
      sent: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }

  async getInvitationAnalytics(eventId) {
    const invitation = await this.repo.findPublishedInvitation(eventId);
    const stats = await this.repo.getInviteAnalytics(eventId);
    const rsvps = await this.repo.getRsvpsForEvent(eventId);

    const guestsResponded = new Set(
      rsvps.filter((rsvp) => rsvp.respondedAt).map((rsvp) => rsvp.guestId),
    ).size;

    const byStatus = { attending: 0, declined: 0, maybe: 0, pending: 0 };
    for (const rsvp of rsvps) {
      if (rsvp.respondedAt) {
        byStatus[rsvp.status] = (byStatus[rsvp.status] ?? 0) + 1;
      }
    }

    const invited = stats.sent + stats.opened + stats.responded;

    return {
      publishedInvitation: invitation
        ? {
            id: invitation.id,
            slug: invitation.slug,
            headline: invitation.headline,
          }
        : null,
      totalGuests: stats.total,
      invited,
      attending: byStatus.attending,
      declined: byStatus.declined,
      pending: Math.max(0, stats.total - guestsResponded),
      responseRate: stats.total ? Math.round((guestsResponded / stats.total) * 100) : 0,
      invitationsSent: invited,
      invitationOpens: stats.opened + stats.responded,
      openRate: invited ? Math.round(((stats.opened + stats.responded) / invited) * 100) : 0,
      rsvpReceived: guestsResponded,
      byInviteStatus: {
        not_sent: stats.not_sent,
        sent: stats.sent,
        opened: stats.opened,
        responded: stats.responded,
      },
    };
  }
}

export default new InvitationSendService();
