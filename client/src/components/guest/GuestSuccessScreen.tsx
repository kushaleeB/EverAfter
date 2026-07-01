import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Invitation } from '@/types/api';
import { AddToCalendarButton } from '@/components/guest/AddToCalendarButton';
import { DownloadQrButton } from '@/components/guest/DownloadQrButton';
import { GuestQrCard } from '@/components/guest/GuestQrCard';
import { SaveQrImageButton } from '@/components/guest/SaveQrImageButton';
import { useGuestQr } from '@/hooks/useGuestQr';
import { eventFromInvitation } from '@/lib/calendar';
import { parseRsvpDetails } from '@/lib/rsvpSection';

interface GuestSuccessScreenProps {
  slug: string;
  accessToken: string;
  invitation: Invitation;
  rsvpSectionContent?: Record<string, unknown>;
}

function QrSkeleton() {
  return (
    <div className="mx-auto max-w-sm animate-pulse overflow-hidden rounded-2xl border border-[#e8dfd6] bg-white">
      <div className="border-b border-[#f0ebe4] bg-[#faf7f2] px-5 py-6">
        <div className="mx-auto h-5 w-32 rounded bg-[#e8dfd6]" />
        <div className="mx-auto mt-2 h-3 w-24 rounded bg-[#efe8e0]" />
      </div>
      <div className="px-5 py-8">
        <div className="mx-auto h-48 w-48 rounded-xl bg-[#efe8e0]" />
        <p className="mt-4 text-center font-body text-xs text-[#9e8e82]">Generating your guest pass...</p>
      </div>
    </div>
  );
}

export function GuestSuccessScreen({
  slug,
  accessToken,
  invitation,
  rsvpSectionContent,
}: GuestSuccessScreenProps) {
  const rsvpSection = invitation.sections?.find((section) => section.sectionType === 'rsvp');
  const rsvp = parseRsvpDetails(
    rsvpSection ? { ...rsvpSection, content: rsvpSectionContent ?? rsvpSection.content } : undefined,
    invitation,
  );
  const { data: qr, isLoading, error } = useGuestQr(slug, accessToken, true);
  const eventName =
    invitation.headline?.trim() ||
    [invitation.event?.partnerOne, invitation.event?.partnerTwo].filter(Boolean).join(' & ') ||
    invitation.event?.title ||
    'Wedding Celebration';
  const guestName = qr ? `${qr.guest.firstName} ${qr.guest.lastName}`.trim() : 'Guest';
  const calendarEvent = eventFromInvitation(invitation);

  return (
    <div className="rsvp-success-reveal px-4 py-8 text-center">
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: `${rsvp.accentColor}20` }}
      >
        <CheckCircle2 className="h-8 w-8 rsvp-success-icon" style={{ color: rsvp.accentColor }} />
      </div>

      <p
        className="mt-5 font-display leading-tight text-[#4e342e]"
        style={{ fontSize: `${rsvp.headingFontSize}px`, fontFamily: rsvp.fontFamily }}
      >
        {rsvp.thankYouTitle || 'Thank You'}
      </p>

      <p
        className="mx-auto mt-3 max-w-md font-body leading-relaxed text-[#6d625a]"
        style={{ fontSize: `${rsvp.bodyFontSize}px` }}
      >
        {rsvp.thankYouMessage || 'Your response has been received. We look forward to celebrating with you.'}
      </p>

      <div className="mt-8">
        {isLoading && <QrSkeleton />}

        {!isLoading && qr && (
          <>
            <GuestQrCard qr={qr} eventName={eventName} />
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <DownloadQrButton dataUrl={qr.dataUrl} guestName={guestName} />
              <SaveQrImageButton dataUrl={qr.dataUrl} guestName={guestName} />
              <AddToCalendarButton event={calendarEvent} />
            </div>
          </>
        )}

        {!isLoading && error && (
          <div className="mx-auto max-w-md rounded-2xl border border-[#e8dfd6] bg-[#faf7f2] px-5 py-4">
            <p className="font-body text-sm text-[#4e342e]">Your RSVP has been received successfully.</p>
            <p className="mt-2 font-body text-xs leading-relaxed text-[#6d625a]">
              We couldn&apos;t generate your guest pass right now. Please contact the couple if you need assistance.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <Link
          to={`/invite/${slug}${accessToken ? `?accessToken=${encodeURIComponent(accessToken)}` : ''}`}
          className="inline-flex items-center justify-center rounded-full border border-[#e8dfd6] bg-white px-5 py-2.5 font-body text-sm font-medium text-[#4e342e] transition-colors hover:border-[#c5a67c] hover:bg-[#faf7f2]"
        >
          Return to Invitation
        </Link>
      </div>
    </div>
  );
}
