import { useEffect, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Church,
  Heart,
  MapPin,
  Music2,
  Sparkles,
  UtensilsCrossed,
  Wine,
  type LucideIcon,
} from 'lucide-react';
import type { InvitationSection } from '@/types/api';
import {
  dressCodeLabel,
  eventStatusBadgeClass,
  eventStatusLabel,
  formatScheduleDate,
  formatScheduleTimeRange,
  isValidMapsUrl,
  parseScheduleDetails,
  scheduleAnimationClass,
  scheduleCardClass,
  type ScheduleDetailsContent,
  type ScheduleEvent,
  type ScheduleIconStyle,
} from '@/lib/scheduleSection';
import { cn } from '@/lib/utils';

interface ScheduleSectionPreviewProps {
  section: InvitationSection;
}

const ICON_MAP: Record<string, LucideIcon> = {
  church: Church,
  champagne: Wine,
  dinner: UtensilsCrossed,
  cake: Sparkles,
  music: Music2,
  heart: Heart,
  sparkles: Sparkles,
  rings: Sparkles,
};

function ScheduleIcon({
  icon,
  color,
  style,
}: {
  icon: string;
  color: string;
  style: ScheduleIconStyle;
}) {
  const Icon = ICON_MAP[icon];
  if (!Icon) return null;

  if (style === 'minimal') {
    return <Icon className="h-3.5 w-3.5" style={{ color }} />;
  }

  return (
    <span
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-full',
        style === 'filled' ? 'text-white' : 'border bg-white/70',
      )}
      style={{
        backgroundColor: style === 'filled' ? color : undefined,
        borderColor: style === 'outline' ? `${color}66` : undefined,
        color: style === 'outline' ? color : undefined,
      }}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

function DirectionsButton({ url, accent }: { url: string; accent: string }) {
  if (!isValidMapsUrl(url)) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm"
      style={{ backgroundColor: accent }}
    >
      <MapPin className="h-3 w-3" />
      Get Directions
    </a>
  );
}

function EventBadges({ event }: { event: ScheduleEvent }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {event.isMainEvent && (
        <span className="rounded-full bg-[#4e342e] px-2 py-0.5 font-body text-[9px] font-semibold uppercase tracking-[0.1em] text-white">
          Main Event
        </span>
      )}
      <span
        className={cn(
          'rounded-full px-2 py-0.5 font-body text-[9px] font-semibold uppercase tracking-[0.1em]',
          eventStatusBadgeClass(event.status),
        )}
      >
        {eventStatusLabel(event.status)}
      </span>
      {event.enableReminderBadge && (
        <span className="rounded-full bg-[#fff3e0] px-2 py-0.5 font-body text-[9px] font-semibold uppercase tracking-[0.1em] text-[#e65100]">
          Reminder Set
        </span>
      )}
    </div>
  );
}

function EventCardContent({
  event,
  schedule,
  compact = false,
}: {
  event: ScheduleEvent;
  schedule: ScheduleDetailsContent;
  compact?: boolean;
}) {
  const timeLine =
    event.showTime && event.startTime
      ? formatScheduleTimeRange(event.startTime, event.endTime)
      : '';
  const venueLine = event.showVenue
    ? [event.venueName, event.venueAddress].filter(Boolean).join(', ')
    : '';
  const mapsUrl = event.mapsUrl || schedule.venueInfo.mapsUrl;

  return (
    <>
      {event.backgroundImageUrl && (
        <img
          src={event.backgroundImageUrl}
          alt=""
          className={cn('w-full object-cover', compact ? 'mb-3 h-24 rounded-lg' : 'mb-4 h-32 rounded-xl')}
        />
      )}
      {event.date && (
        <p
          className="font-body text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: schedule.accentColor }}
        >
          {formatScheduleDate(event.date)}
          {timeLine ? ` · ${timeLine}` : ''}
        </p>
      )}
      {!event.date && timeLine && (
        <p
          className="font-body text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: schedule.accentColor }}
        >
          {timeLine}
        </p>
      )}
      <div className="mt-2 flex items-start gap-2">
        {event.icon && (
          <span className="mt-0.5 shrink-0">
            <ScheduleIcon icon={event.icon} color={schedule.accentColor} style={schedule.iconStyle} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p
            className="font-display leading-snug"
            style={{
              fontFamily: schedule.fontFamily,
              fontSize: `${schedule.headingFontSize - (compact ? 10 : 6)}px`,
              color: schedule.textColor,
            }}
          >
            {event.title || 'Event'}
          </p>
          <EventBadges event={event} />
        </div>
      </div>
      {event.showCountdown && event.date && (
        <p className="mt-2 font-body text-xs italic opacity-75" style={{ color: schedule.accentColor }}>
          Counting down to this moment
        </p>
      )}
      {venueLine && (
        <p
          className="mt-2 font-body leading-relaxed opacity-80"
          style={{ fontSize: `${schedule.bodyFontSize}px`, color: schedule.textColor }}
        >
          {venueLine}
        </p>
      )}
      {event.showDescription && event.description && (
        <p
          className="mt-2 font-body leading-relaxed opacity-85"
          style={{ fontSize: `${schedule.bodyFontSize}px`, color: schedule.textColor }}
        >
          {event.description}
        </p>
      )}
      {event.showMapButton && <DirectionsButton url={mapsUrl} accent={schedule.accentColor} />}
    </>
  );
}

function TimelineLayout({
  events,
  schedule,
  luxury = false,
}: {
  events: ScheduleEvent[];
  schedule: ScheduleDetailsContent;
  luxury?: boolean;
}) {
  return (
    <div className="mt-8 space-y-5">
      {events.map((event) => (
        <div key={event.id} className="schedule-reveal-item relative flex gap-4 pl-4">
          <div
            className="absolute bottom-0 left-[15px] top-0 w-px"
            style={{ backgroundColor: schedule.timelineLineColor }}
          />
          <div
            className={cn(
              'relative z-10 mt-1 shrink-0 rounded-full',
              luxury ? 'h-3 w-3 ring-4 ring-white/80' : 'h-2.5 w-2.5',
            )}
            style={{ backgroundColor: schedule.accentColor }}
          />
          <div
            className={cn('min-w-0 flex-1 pb-1', luxury && 'rounded-2xl p-4', luxury && scheduleCardClass(schedule.cardStyle))}
            style={luxury ? { borderRadius: schedule.borderRadius } : undefined}
          >
            <EventCardContent event={event} schedule={schedule} />
          </div>
        </div>
      ))}
    </div>
  );
}

function CardsLayout({ events, schedule }: { events: ScheduleEvent[]; schedule: ScheduleDetailsContent }) {
  return (
    <div className="mt-8 space-y-4">
      {events.map((event) => (
        <article
          key={event.id}
          className={cn('schedule-reveal-item p-4', scheduleCardClass(schedule.cardStyle))}
          style={{ borderRadius: schedule.borderRadius }}
        >
          <EventCardContent event={event} schedule={schedule} />
        </article>
      ))}
    </div>
  );
}

function ClassicListLayout({
  events,
  schedule,
}: {
  events: ScheduleEvent[];
  schedule: ScheduleDetailsContent;
}) {
  return (
    <div className="mt-8 divide-y" style={{ borderColor: `${schedule.accentColor}33` }}>
      {events.map((event) => (
        <div key={event.id} className="schedule-reveal-item flex gap-4 py-4">
          <div className="w-16 shrink-0">
            {event.showTime && event.startTime && (
              <p className="font-body text-xs font-semibold" style={{ color: schedule.accentColor }}>
                {event.startTime}
              </p>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <EventCardContent event={event} schedule={schedule} compact />
          </div>
        </div>
      ))}
    </div>
  );
}

function ModernMinimalLayout({
  events,
  schedule,
}: {
  events: ScheduleEvent[];
  schedule: ScheduleDetailsContent;
}) {
  return (
    <div className="mt-8 space-y-6">
      {events.map((event) => (
        <div key={event.id} className="schedule-reveal-item border-l-2 pl-4" style={{ borderColor: schedule.accentColor }}>
          <EventCardContent event={event} schedule={schedule} compact />
        </div>
      ))}
    </div>
  );
}

function HorizontalLayout({
  events,
  schedule,
}: {
  events: ScheduleEvent[];
  schedule: ScheduleDetailsContent;
}) {
  return (
    <div className="mt-8 -mx-2 flex gap-3 overflow-x-auto px-2 pb-2">
      {events.map((event) => (
        <div
          key={event.id}
          className={cn('schedule-reveal-item w-[220px] shrink-0 p-4', scheduleCardClass(schedule.cardStyle))}
          style={{ borderRadius: schedule.borderRadius }}
        >
          <EventCardContent event={event} schedule={schedule} compact />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-[#e8dfd6] bg-white/50 px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#faf7f2] text-[#c5a67c]">
        <CalendarDays className="h-7 w-7" />
      </div>
      <p className="mt-4 font-display text-lg text-[#4e342e]">Your schedule awaits</p>
      <p className="mt-2 font-body text-sm text-[#9e8e82]">
        Add events to build your wedding weekend timeline.
      </p>
    </div>
  );
}

function InfoBlock({
  title,
  children,
  schedule,
}: {
  title: string;
  children: React.ReactNode;
  schedule: ScheduleDetailsContent;
}) {
  return (
    <div
      className={cn('mt-6 rounded-2xl p-4 text-left', scheduleCardClass(schedule.cardStyle))}
      style={{ borderRadius: schedule.borderRadius }}
    >
      <p
        className="font-body text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: schedule.accentColor }}
      >
        {title}
      </p>
      <div
        className="mt-2 space-y-2 font-body leading-relaxed opacity-85"
        style={{ fontSize: `${schedule.bodyFontSize}px`, color: schedule.textColor }}
      >
        {children}
      </div>
    </div>
  );
}

export function ScheduleSectionPreview({ section }: ScheduleSectionPreviewProps) {
  const schedule = parseScheduleDetails(section);
  const animClass = scheduleAnimationClass(schedule.animation);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowContent(true), 120);
    return () => window.clearTimeout(timer);
  }, [section.id]);

  const notes = [
    schedule.specialNotes.arrivalInstructions && {
      label: 'Arrival',
      value: schedule.specialNotes.arrivalInstructions,
    },
    schedule.specialNotes.weatherNotes && {
      label: 'Weather',
      value: schedule.specialNotes.weatherNotes,
    },
    schedule.specialNotes.photographyPolicy && {
      label: 'Photography',
      value: schedule.specialNotes.photographyPolicy,
    },
    schedule.specialNotes.childrenPolicy && {
      label: 'Children',
      value: schedule.specialNotes.childrenPolicy,
    },
    schedule.specialNotes.ceremonyEtiquette && {
      label: 'Etiquette',
      value: schedule.specialNotes.ceremonyEtiquette,
    },
    schedule.specialNotes.specialInstructions && {
      label: 'Note',
      value: schedule.specialNotes.specialInstructions,
    },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const venue = schedule.venueInfo;

  return (
    <section
      className={cn('relative overflow-hidden text-center', animClass)}
      style={{
        backgroundColor: schedule.backgroundColor,
        borderRadius: schedule.borderRadius,
        padding: schedule.sectionPadding,
      }}
    >
      {schedule.backgroundImageUrl && (
        <img src={schedule.backgroundImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      {schedule.backgroundImageUrl && schedule.overlayOpacity > 0 && (
        <div className="absolute inset-0 bg-black" style={{ opacity: schedule.overlayOpacity }} />
      )}

      <div className={cn('relative z-10', !showContent && 'schedule-skeleton')}>
        <p
          className="font-display leading-tight"
          style={{
            fontFamily: schedule.fontFamily,
            fontSize: `${schedule.headingFontSize}px`,
            color: schedule.textColor,
          }}
        >
          {schedule.sectionTitle}
        </p>
        {schedule.subtitle && (
          <p
            className="mt-2 font-body font-semibold uppercase tracking-[0.16em] opacity-80"
            style={{ fontSize: `${schedule.bodyFontSize}px`, color: schedule.textColor }}
          >
            {schedule.subtitle}
          </p>
        )}
        {schedule.description && (
          <p
            className="mt-3 font-body leading-relaxed opacity-85"
            style={{ fontSize: `${schedule.bodyFontSize + 1}px`, color: schedule.textColor }}
          >
            {schedule.description}
          </p>
        )}
        {schedule.introMessage && (
          <p
            className="mx-auto mt-4 max-w-[280px] font-body italic leading-relaxed opacity-75"
            style={{ fontSize: `${schedule.bodyFontSize}px`, color: schedule.textColor }}
          >
            {schedule.introMessage}
          </p>
        )}

        {schedule.items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="text-left">
            {schedule.layout === 'vertical-timeline' && (
              <TimelineLayout events={schedule.items} schedule={schedule} />
            )}
            {schedule.layout === 'luxury-timeline' && (
              <TimelineLayout events={schedule.items} schedule={schedule} luxury />
            )}
            {schedule.layout === 'elegant-cards' && (
              <CardsLayout events={schedule.items} schedule={schedule} />
            )}
            {schedule.layout === 'classic-list' && (
              <ClassicListLayout events={schedule.items} schedule={schedule} />
            )}
            {schedule.layout === 'modern-minimal' && (
              <ModernMinimalLayout events={schedule.items} schedule={schedule} />
            )}
            {schedule.layout === 'horizontal-timeline' && (
              <HorizontalLayout events={schedule.items} schedule={schedule} />
            )}
          </div>
        )}

        {(venue.venueName || venue.venueAddress) && (
          <InfoBlock title="Venue" schedule={schedule}>
            {venue.venueName && <p className="font-semibold">{venue.venueName}</p>}
            {venue.venueAddress && <p>{venue.venueAddress}</p>}
            {venue.parkingInfo && <p>Parking: {venue.parkingInfo}</p>}
            {venue.transportationDetails && <p>{venue.transportationDetails}</p>}
            {venue.shuttleService && <p>Shuttle: {venue.shuttleService}</p>}
            {venue.entranceInstructions && <p>{venue.entranceInstructions}</p>}
            {venue.accessibilityNotes && <p>{venue.accessibilityNotes}</p>}
            <DirectionsButton url={venue.mapsUrl} accent={schedule.accentColor} />
          </InfoBlock>
        )}

        {(dressCodeLabel(schedule.dressCode) || schedule.dressCode.imageUrl) && (
          <InfoBlock title="Dress Code" schedule={schedule}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" style={{ color: schedule.accentColor }} />
              <span>{dressCodeLabel(schedule.dressCode)}</span>
            </div>
            {schedule.dressCode.imageUrl && (
              <img
                src={schedule.dressCode.imageUrl}
                alt="Dress code"
                className="mt-3 w-full rounded-xl object-cover"
              />
            )}
          </InfoBlock>
        )}

        {notes.length > 0 && (
          <InfoBlock title="Special Notes" schedule={schedule}>
            {notes.map((note) => (
              <p key={note.label}>
                <span className="font-semibold">{note.label}: </span>
                {note.value}
              </p>
            ))}
          </InfoBlock>
        )}
      </div>
    </section>
  );
}
