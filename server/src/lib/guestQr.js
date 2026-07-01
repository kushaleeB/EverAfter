import env from '../config/env.js';
import { buildGuestInvitationUrl } from './guestInviteUrl.js';

export function buildRsvpUrl(invitation, guest) {
  return buildGuestInvitationUrl(invitation.slug, guest.accessToken);
}

/** Structured payload for future POST /api/v1/checkin/scan */
export function buildCheckInQrPayload(guest, invitation) {
  return {
    v: 1,
    guestId: guest.id,
    eventId: invitation.eventId,
    invitationId: invitation.id,
    accessToken: guest.accessToken,
  };
}

export function buildCheckInQrText(guest, invitation) {
  return JSON.stringify(buildCheckInQrPayload(guest, invitation));
}

/** Public API shape — never expose raw accessToken in JSON responses. */
export function toPublicGuestQrResponse(result) {
  return {
    dataUrl: result.dataUrl,
    rsvpUrl: result.rsvpUrl,
    guest: result.guest,
    invitation: result.invitation,
  };
}

export async function generateGuestQrResult(guest, invitation, format = 'dataurl') {
  const { generateQrDataUrl, generateQrBuffer } = await import('./qr.js');
  const rsvpUrl = buildRsvpUrl(invitation, guest);
  const qrText = buildCheckInQrText(guest, invitation);

  if (format === 'png') {
    const buffer = await generateQrBuffer(qrText);
    return { buffer, rsvpUrl, contentType: 'image/png' };
  }

  const dataUrl = await generateQrDataUrl(qrText);
  return {
    dataUrl,
    rsvpUrl,
    guest: {
      id: guest.id,
      firstName: guest.firstName,
      lastName: guest.lastName,
    },
    invitation: {
      id: invitation.id,
      slug: invitation.slug,
    },
  };
}
