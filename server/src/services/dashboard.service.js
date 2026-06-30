import prisma from '../lib/prisma.js';

function resolveGuestRsvpStatus(rsvps) {
  if (!rsvps?.length) return 'pending';

  const responded = rsvps.filter((rsvp) => rsvp.respondedAt);
  if (!responded.length) return 'pending';

  const latest = responded.sort(
    (a, b) => new Date(b.respondedAt) - new Date(a.respondedAt),
  )[0];

  return latest.status;
}

export class DashboardService {
  async getSummary(userId) {
    const events = await prisma.event.findMany({
      where: { ownerId: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        invitations: { where: { deletedAt: null } },
        guests: {
          where: { deletedAt: null },
          include: { rsvps: true },
        },
      },
    });

    const totalEvents = events.length;
    const publishedInvitations = events.reduce(
      (sum, event) =>
        sum + event.invitations.filter((invitation) => invitation.status === 'published').length,
      0,
    );

    const allGuests = events.flatMap((event) => event.guests);
    const totalGuests = allGuests.length;

    const respondedGuests = allGuests.filter((guest) => {
      const status = resolveGuestRsvpStatus(guest.rsvps);
      return status !== 'pending';
    }).length;

    const rsvpResponseRate =
      totalGuests > 0 ? Math.round((respondedGuests / totalGuests) * 100) : 0;

    const recent = events[0];
    let recentEvent = null;

    if (recent) {
      const guestCount = recent.guests.length;
      const responded = recent.guests.filter((guest) => {
        const status = resolveGuestRsvpStatus(guest.rsvps);
        return status !== 'pending';
      }).length;

      recentEvent = {
        id: recent.id,
        title: recent.title,
        partnerOne: recent.partnerOne,
        partnerTwo: recent.partnerTwo,
        eventDate: recent.eventDate,
        venueName: recent.venueName,
        venueAddress: recent.venueAddress,
        coverImageUrl: recent.coverImageUrl,
        planningProgress: guestCount > 0 ? Math.round((responded / guestCount) * 100) : 0,
      };
    }

    return {
      totalEvents,
      publishedInvitations,
      totalGuests,
      rsvpResponseRate,
      recentEvent,
    };
  }
}

export default new DashboardService();
