import env from '../config/env.js';

export function buildPublicInviteUrl(slug) {
  const base = env.APP_URL.replace(/\/$/, '');
  return `${base}/invite/${slug}`;
}

export function toPublishPayload(invitation) {
  return {
    id: invitation.id,
    slug: invitation.slug,
    publicUrl: buildPublicInviteUrl(invitation.slug),
    publishedAt: invitation.publishedAt,
    status: invitation.status === 'published' ? 'PUBLISHED' : String(invitation.status).toUpperCase(),
    publicSlug: invitation.slug,
  };
}
