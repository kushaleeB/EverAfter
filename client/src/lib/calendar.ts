export interface CalendarEventInfo {
  title: string;
  startDate: string | null;
  startTime?: string | null;
  timezone?: string;
  venueName?: string | null;
  venueAddress?: string | null;
  description?: string;
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function toGoogleDate(date: Date) {
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    'T',
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
    'Z',
  ].join('');
}

function parseEventStart(event: CalendarEventInfo): Date | null {
  if (!event.startDate) return null;

  const datePart = event.startDate.slice(0, 10);
  const timePart = event.startTime?.trim() || '12:00';
  const iso = `${datePart}T${timePart.length === 5 ? `${timePart}:00` : timePart}`;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildLocation(event: CalendarEventInfo) {
  return [event.venueName, event.venueAddress].filter(Boolean).join(', ');
}

export function generateGoogleCalendarLink(event: CalendarEventInfo): string {
  const start = parseEventStart(event);
  if (!start) return 'https://calendar.google.com/calendar/render?action=TEMPLATE';

  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toGoogleDate(start)}/${toGoogleDate(end)}`,
    details: event.description ?? '',
    location: buildLocation(event),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcsText(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export function generateIcsContent(event: CalendarEventInfo): string {
  const start = parseEventStart(event);
  const stamp = toGoogleDate(new Date());
  const uid = `everafter-${Date.now()}@everafter.app`;

  const startLine = start ? toGoogleDate(start) : stamp;
  const endLine = start ? toGoogleDate(new Date(start.getTime() + 3 * 60 * 60 * 1000)) : stamp;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EverAfter//Wedding Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${startLine}`,
    `DTEND:${endLine}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    event.description ? `DESCRIPTION:${escapeIcsText(event.description)}` : null,
    buildLocation(event) ? `LOCATION:${escapeIcsText(buildLocation(event))}` : null,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}

export function downloadIcsFile(event: CalendarEventInfo, fileName = 'everafter-event.ics') {
  const blob = new Blob([generateIcsContent(event)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function eventFromInvitation(invitation: {
  headline: string | null;
  subheadline: string | null;
  event?: {
    title: string;
    partnerOne: string | null;
    partnerTwo: string | null;
    eventDate: string | null;
    venueName?: string | null;
    venueAddress?: string | null;
  } | null;
}): CalendarEventInfo {
  const event = invitation.event;
  const title =
    invitation.headline?.trim() ||
    [event?.partnerOne, event?.partnerTwo].filter(Boolean).join(' & ') ||
    event?.title ||
    'Wedding Celebration';

  return {
    title,
    startDate: event?.eventDate ?? null,
    venueName: event?.venueName,
    venueAddress: event?.venueAddress,
    description: invitation.subheadline ?? 'We look forward to celebrating with you.',
  };
}
