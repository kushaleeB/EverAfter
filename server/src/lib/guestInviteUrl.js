import env from '../config/env.js';

export function buildPublicInviteUrl(slug) {
  const base = env.APP_URL.replace(/\/$/, '');
  return `${base}/invite/${slug}`;
}

export function buildGuestInvitationUrl(slug, accessToken) {
  const base = env.APP_URL.replace(/\/$/, '');
  const url = new URL(`${base}/invite/${slug}`);
  url.searchParams.set('guest', accessToken);
  return url.toString();
}

export function buildWhatsAppInviteMessage(invitationUrl) {
  return `You're invited to our wedding!\n\n${invitationUrl}`;
}

export function buildWhatsAppShareUrl(message) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function toApiInviteStatus(status) {
  return String(status ?? 'not_sent').toUpperCase();
}
