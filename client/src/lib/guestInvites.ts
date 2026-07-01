import { buildPublicInviteUrl } from '@/lib/invitationUrls';

export function buildGuestWhatsAppUrl(invitationUrl: string) {
  const message = `You're invited to our wedding!\n\n${invitationUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function exportGuestLinksCsv(
  guests: Array<{ firstName: string; lastName: string; email: string | null }>,
  slug: string,
) {
  const publicUrl = buildPublicInviteUrl(slug);
  const header = 'First Name,Last Name,Email,Invitation Link';
  const rows = guests.map((guest) => {
    const cells = [guest.firstName, guest.lastName, guest.email ?? '', publicUrl].map(
      (value) => `"${String(value).replace(/"/g, '""')}"`,
    );
    return cells.join(',');
  });

  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `everafter-guest-list-${slug}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** Future-ready: personalized guest links can be built here without changing public flow. */
export function buildPersonalizedGuestUrl(slug: string, accessToken: string) {
  const base = buildPublicInviteUrl(slug);
  const url = new URL(base);
  url.searchParams.set('guest', accessToken);
  return url.toString();
}
