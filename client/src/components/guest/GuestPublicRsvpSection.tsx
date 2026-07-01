import { useEffect, useState } from 'react';
import { publicApi } from '@/api/public';
import { GuestIdentifyStep } from '@/components/guest/GuestIdentifyStep';
import { RsvpGuestSection } from '@/components/guest/RsvpGuestSection';
import { ApiError } from '@/lib/api';
import { parseRsvpDetails } from '@/lib/rsvpSection';
import type { Invitation, InvitationSection } from '@/types/api';
import type { PublicGuest, PublicGuestSearchResult } from '@/types/public';

interface GuestPublicRsvpSectionProps {
  section: InvitationSection;
  invitation: Invitation;
  slug: string;
}

function AlreadyRespondedMessage({ guestName }: { guestName: string }) {
  return (
    <section className="px-6 py-12 text-center">
      <div className="mx-auto max-w-md rounded-2xl border border-[#e8dfd6] bg-[#faf9f6] px-6 py-8">
        <p className="font-display text-2xl text-[#4e342e]">Thank you.</p>
        <p className="mt-3 font-body text-sm leading-relaxed text-[#6d625a]">
          We have already received your RSVP, {guestName}.
        </p>
      </div>
    </section>
  );
}

export function GuestPublicRsvpSection({ section, invitation, slug }: GuestPublicRsvpSectionProps) {
  const rsvpConfig = parseRsvpDetails(section, invitation);
  const [selectedGuest, setSelectedGuest] = useState<PublicGuestSearchResult | null>(null);
  const [existingRsvp, setExistingRsvp] = useState<{ respondedAt: string | null } | null>(null);
  const [checkingRsvp, setCheckingRsvp] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedGuest) {
      setExistingRsvp(null);
      return;
    }

    let cancelled = false;
    setCheckingRsvp(true);
    setCheckError(null);

    publicApi
      .getGuestRsvp(slug, { guestId: selectedGuest.id })
      .then((result) => {
        if (!cancelled) setExistingRsvp(result.rsvp);
      })
      .catch((err) => {
        if (!cancelled) {
          setCheckError(err instanceof ApiError ? err.message : 'Unable to verify RSVP status.');
        }
      })
      .finally(() => {
        if (!cancelled) setCheckingRsvp(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedGuest, slug]);

  if (!selectedGuest) {
    return <GuestIdentifyStep slug={slug} onSelect={setSelectedGuest} />;
  }

  if (checkingRsvp) {
    return (
      <section className="px-6 py-12 text-center">
        <p className="font-body text-sm text-[#6d625a]">Checking your RSVP...</p>
      </section>
    );
  }

  if (checkError) {
    return (
      <section className="px-6 py-12 text-center">
        <p className="font-body text-sm text-red-600">{checkError}</p>
        <button
          type="button"
          onClick={() => setSelectedGuest(null)}
          className="mt-4 font-body text-sm text-[#705639] underline"
        >
          Choose a different guest
        </button>
      </section>
    );
  }

  const guestName = `${selectedGuest.firstName} ${selectedGuest.lastName}`.trim();
  const guest: PublicGuest = selectedGuest;
  const hasResponded = Boolean(existingRsvp?.respondedAt);
  const canEdit = rsvpConfig.allowEditBeforeDeadline && hasResponded;

  if (hasResponded && !canEdit) {
    return <AlreadyRespondedMessage guestName={guestName} />;
  }

  return (
    <div>
      <div className="border-b border-[#f0ebe6] bg-[#faf9f6] px-6 py-3 text-center">
        <p className="font-body text-xs uppercase tracking-[0.12em] text-[#9e8e82]">RSVP for</p>
        <p className="font-display text-lg text-[#4e342e]">{guestName}</p>
        <button
          type="button"
          onClick={() => setSelectedGuest(null)}
          className="mt-1 font-body text-xs text-[#705639] underline"
        >
          Not you? Search again
        </button>
      </div>
      <RsvpGuestSection
        section={section}
        invitation={invitation}
        guest={guest}
        guestId={selectedGuest.id}
        initialResponded={canEdit}
        allowEdit={canEdit}
      />
    </div>
  );
}
