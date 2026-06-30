import type { Invitation, InvitationSection } from '@/types/api';
import {
  backgroundPositionToCss,
  contentWidthToCss,
  formatWeddingDateTime,
  parseHeroDetails,
  verticalPositionToJustify,
} from '@/lib/heroSection';
import { GallerySectionPreview } from '@/components/invitations/GallerySectionPreview';
import { RsvpSectionPreview } from '@/components/invitations/RsvpSectionPreview';
import { ScheduleSectionPreview } from '@/components/invitations/ScheduleSectionPreview';
import { StorySectionPreview } from '@/components/invitations/StorySectionPreview';
import { SECTION_FLOW_LABELS } from '@/lib/invitations';
import { cn } from '@/lib/utils';
import type { RsvpAnalytics } from '@/types/api';

interface InvitationPreviewProps {
  invitation: Invitation;
  activeSection: InvitationSection | null;
  rsvpAnalytics?: RsvpAnalytics | null;
}

export function InvitationPreview({ invitation, activeSection, rsvpAnalytics }: InvitationPreviewProps) {
  const heroSection = invitation.sections?.find((section) => section.sectionType === 'hero');
  const hero = parseHeroDetails(heroSection, invitation);
  const coupleNames = invitation.headline?.trim() || 'Sophia & James';
  const subtitle = invitation.subheadline?.trim() || 'Are getting married';
  const isHeroActive = !activeSection || activeSection.sectionType === 'hero';
  const isStoryActive = activeSection?.sectionType === 'story';
  const isScheduleActive = activeSection?.sectionType === 'schedule';
  const isGalleryActive = activeSection?.sectionType === 'gallery';
  const isRsvpActive = activeSection?.sectionType === 'rsvp';

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
    <div className="flex flex-1 items-start justify-center overflow-y-auto bg-[#ece7e1] p-8">
      <div className="w-full max-w-[320px] overflow-hidden rounded-[2rem] border-[10px] border-[#1f1b18] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        {isHeroActive && (
          <section
            className={cn('relative overflow-hidden', hero.animation === 'fade-in' && 'hero-fade-in')}
            style={{
              minHeight: heroHeight,
              borderRadius: hero.borderRadius,
            }}
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

            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: hero.overlayOpacity }}
            />

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
                  style={{
                    color: hero.textColor,
                    fontSize: `${Math.max(hero.subtitleFontSize - 1, 8)}px`,
                  }}
                >
                  {hero.invitationTitle}
                </p>

                <p
                  className="mt-3 leading-tight"
                  style={{
                    fontFamily: hero.fontFamily,
                    fontSize: `${hero.titleFontSize}px`,
                    color: hero.textColor,
                  }}
                >
                  {coupleNames}
                </p>

                {hero.showSubheading && (
                  <p
                    className="mt-3 font-body font-semibold uppercase tracking-[0.2em] opacity-90"
                    style={{
                      fontSize: `${hero.subtitleFontSize}px`,
                      color: hero.textColor,
                    }}
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

                {hero.ctaText.trim() && (
                  <button
                    type="button"
                    className="mt-6 rounded-full border border-white/40 bg-white/15 px-5 py-2 font-body text-xs font-semibold uppercase tracking-[0.14em] backdrop-blur-sm"
                    style={{ color: hero.textColor }}
                  >
                    {hero.ctaText}
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {isStoryActive && activeSection && <StorySectionPreview section={activeSection} />}

        {isScheduleActive && activeSection && <ScheduleSectionPreview section={activeSection} />}

        {isGalleryActive && activeSection && <GallerySectionPreview section={activeSection} />}

        {isRsvpActive && activeSection && (
          <RsvpSectionPreview section={activeSection} invitation={invitation} analytics={rsvpAnalytics} />
        )}

        {activeSection &&
          activeSection.sectionType !== 'hero' &&
          activeSection.sectionType !== 'story' &&
          activeSection.sectionType !== 'schedule' &&
          activeSection.sectionType !== 'gallery' &&
          activeSection.sectionType !== 'rsvp' && (
          <section className="px-6 py-10 text-center">
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c5a67c]">
              {SECTION_FLOW_LABELS[activeSection.sectionType]}
            </p>
            <p className="mt-4 font-body text-sm text-[#6d625a]">
              {invitation.bodyContent?.trim() ||
                'Content for this section will appear on your live invitation.'}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
