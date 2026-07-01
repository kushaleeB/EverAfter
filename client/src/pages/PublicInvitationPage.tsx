import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { publicApi } from '@/api/public';
import { GallerySectionPreview } from '@/components/invitations/GallerySectionPreview';
import { RsvpGuestSection } from '@/components/guest/RsvpGuestSection';
import { ScheduleSectionPreview } from '@/components/invitations/ScheduleSectionPreview';
import { StorySectionPreview } from '@/components/invitations/StorySectionPreview';
import { GuestSuccessScreen } from '@/components/guest/GuestSuccessScreen';
import {
  backgroundPositionToCss,
  contentWidthToCss,
  formatWeddingDateTime,
  parseHeroDetails,
  verticalPositionToJustify,
} from '@/lib/heroSection';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Invitation, InvitationSection } from '@/types/api';
import type { PublicInvitationPage } from '@/types/public';

function PublicHero({ invitation }: { invitation: Invitation }) {
  const heroSection = invitation.sections?.find((section) => section.sectionType === 'hero');
  const hero = parseHeroDetails(heroSection, invitation);
  const coupleNames = invitation.headline?.trim() || 'Our Wedding';
  const subtitle = invitation.subheadline?.trim() || 'Are getting married';
  const heroHeight = hero.fullHeight ? Math.max(hero.heroHeight, 420) : hero.heroHeight;
  const textAlignClass =
    hero.textAlign === 'left'
      ? 'items-start text-left'
      : hero.textAlign === 'right'
        ? 'items-end text-right'
        : 'items-center text-center';
  const dateLine = formatWeddingDateTime(hero.weddingDate, hero.weddingTime);
  const venueLine = [hero.venueName, hero.venueAddress].filter(Boolean).join(', ');

  return (
    <section
      className={cn('relative overflow-hidden', hero.animation === 'fade-in' && 'hero-fade-in')}
      style={{ minHeight: heroHeight, borderRadius: hero.borderRadius }}
    >
      {hero.imageUrl ? (
        <img
          src={hero.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full"
          style={{
            objectFit: hero.backgroundSize,
            objectPosition: backgroundPositionToCss(hero.backgroundPosition),
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[#f5ebe3]" />
      )}
      <div className="absolute inset-0 bg-black" style={{ opacity: hero.overlayOpacity }} />
      <div
        className={cn('relative z-10 flex h-full min-h-[inherit] flex-col px-6', textAlignClass)}
        style={{
          minHeight: heroHeight,
          justifyContent: verticalPositionToJustify(hero.verticalPosition),
          paddingTop: hero.sectionSpacing,
          paddingBottom: hero.sectionSpacing,
        }}
      >
        <div style={{ width: contentWidthToCss(hero.contentWidth), maxWidth: '100%' }}>
          <p
            className="font-body font-semibold uppercase tracking-[0.18em] opacity-90"
            style={{ color: hero.textColor, fontSize: `${Math.max(hero.subtitleFontSize - 1, 8)}px` }}
          >
            {hero.invitationTitle}
          </p>
          <p
            className="mt-3 leading-tight"
            style={{ fontFamily: hero.fontFamily, fontSize: `${hero.titleFontSize}px`, color: hero.textColor }}
          >
            {coupleNames}
          </p>
          {hero.showSubheading && (
            <p
              className="mt-3 font-body font-semibold uppercase tracking-[0.2em] opacity-90"
              style={{ fontSize: `${hero.subtitleFontSize}px`, color: hero.textColor }}
            >
              {subtitle}
            </p>
          )}
          {hero.showDate && dateLine && (
            <p
              className="mt-5 font-body leading-relaxed opacity-95"
              style={{ fontSize: `${hero.subtitleFontSize + 2}px`, color: hero.textColor }}
            >
              {dateLine}
            </p>
          )}
          {hero.showVenue && venueLine && (
            <p
              className="mt-3 font-body leading-relaxed opacity-90"
              style={{ fontSize: `${hero.subtitleFontSize + 1}px`, color: hero.textColor }}
            >
              {venueLine}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function renderSection(
  section: InvitationSection,
  invitation: Invitation,
  accessToken: string | undefined,
  page: PublicInvitationPage,
) {
  if (!section.isVisible) return null;

  switch (section.sectionType) {
    case 'hero':
      return <PublicHero key={section.id} invitation={invitation} />;
    case 'story':
      return <StorySectionPreview key={section.id} section={section} />;
    case 'schedule':
      return <ScheduleSectionPreview key={section.id} section={section} />;
    case 'gallery':
      return <GallerySectionPreview key={section.id} section={section} />;
    case 'rsvp':
      if (!accessToken || !page.guest) {
        return (
          <section key={section.id} className="px-6 py-10 text-center">
            <p className="font-body text-sm text-[#6d625a]">
              Please use your personal invitation link to RSVP.
            </p>
          </section>
        );
      }

      if (page.rsvp?.respondedAt) {
        return (
          <GuestSuccessScreen
            key={section.id}
            slug={invitation.slug}
            accessToken={accessToken}
            invitation={invitation}
          />
        );
      }

      return (
        <RsvpGuestSection
          key={section.id}
          section={section}
          invitation={invitation}
          accessToken={accessToken}
          guest={page.guest}
        />
      );
    default:
      return (
        <section key={section.id} className="px-6 py-10 text-center">
          <p className="font-body text-sm text-[#6d625a]">
            {invitation.bodyContent?.trim() || 'Section content will appear here.'}
          </p>
        </section>
      );
  }
}

export function PublicInvitationPage() {
  const { slug = '' } = useParams();
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('accessToken') ?? searchParams.get('token') ?? undefined;

  const [page, setPage] = useState<PublicInvitationPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    publicApi
      .getPublicPage(slug, accessToken)
      .then((data) => {
        if (!cancelled) setPage(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Unable to load this invitation.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, accessToken]);

  const sections = useMemo(
    () => [...(page?.invitation.sections ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [page?.invitation.sections],
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f3ee]">
        <p className="font-body text-sm text-[#6d625a]">Loading invitation...</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f3ee] px-6">
        <div className="max-w-md rounded-2xl border border-[#e8dfd6] bg-white px-6 py-8 text-center">
          <p className="font-display text-xl text-[#4e342e]">Invitation unavailable</p>
          <p className="mt-3 font-body text-sm text-[#6d625a]">{error ?? 'This invitation could not be found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ee] py-6">
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-[2rem] border-[10px] border-[#1f1b18] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
        {sections.map((section) => renderSection(section, page.invitation, accessToken, page))}
      </div>
    </div>
  );
}
