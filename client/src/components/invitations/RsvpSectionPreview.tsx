import { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, Download, QrCode } from 'lucide-react';
import type { Invitation, InvitationSection, RsvpAnalytics } from '@/types/api';
import {
  computeDeadlineCountdown,
  parseRsvpDetails,
  rsvpButtonHoverClass,
  rsvpWidthToCss,
  visibleFormFields,
  type RsvpDetailsContent,
} from '@/lib/rsvpSection';
import { cn } from '@/lib/utils';

interface RsvpSectionPreviewProps {
  section: InvitationSection;
  invitation: Invitation;
  analytics?: RsvpAnalytics | null;
}

function CountdownBlock({ rsvp }: { rsvp: RsvpDetailsContent }) {
  const [countdown, setCountdown] = useState(() => computeDeadlineCountdown(rsvp.deadline));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(computeDeadlineCountdown(rsvp.deadline));
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [rsvp.deadline]);

  if (!rsvp.deadline.date || !countdown) return null;

  return (
    <div
      className="mx-auto mt-5 max-w-[260px] rounded-2xl border border-[#e8dfd6]/80 bg-white/70 px-4 py-3 backdrop-blur-sm"
      style={{ borderColor: `${rsvp.accentColor}40` }}
    >
      <p className="font-body text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: rsvp.accentColor }}>
        {countdown.expired ? 'RSVP closed' : 'RSVP closes in'}
      </p>
      {!countdown.expired && (
        <div className="mt-2 flex justify-center gap-4">
          {[
            { label: 'Days', value: countdown.days },
            { label: 'Hours', value: countdown.hours },
            { label: 'Minutes', value: countdown.minutes },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="font-display text-lg leading-none" style={{ color: rsvp.accentColor }}>
                {String(item.value).padStart(2, '0')}
              </p>
              <p className="mt-1 font-body text-[9px] uppercase tracking-wider opacity-60">{item.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PreviewInput({
  rsvp,
  placeholder,
  type = 'text',
  multiline = false,
}: {
  rsvp: RsvpDetailsContent;
  placeholder: string;
  type?: string;
  multiline?: boolean;
}) {
  const baseClass = cn(
    'w-full rounded-xl px-3 py-2.5 font-body outline-none transition-colors',
    rsvp.inputStyle === 'glass' && 'border border-white/60 bg-white/50 backdrop-blur-sm',
    rsvp.inputStyle === 'outlined' && 'border border-[#e8dfd6] bg-white',
    rsvp.inputStyle === 'filled' && 'border border-transparent bg-[#f5f0ea]',
    rsvp.inputStyle === 'minimal' && 'border-b border-[#e8dfd6] bg-transparent rounded-none px-0',
  );

  const style = { fontSize: `${rsvp.bodyFontSize}px`, color: '#4e342e' };

  if (multiline) {
    return (
      <textarea
        readOnly
        rows={3}
        placeholder={placeholder}
        className={baseClass}
        style={style}
      />
    );
  }

  return <input readOnly type={type} placeholder={placeholder} className={baseClass} style={style} />;
}

function RsvpFormPreview({ rsvp }: { rsvp: RsvpDetailsContent }) {
  const fields = visibleFormFields(rsvp);
  const enabledAttendance = rsvp.attendanceOptions.filter((option) => option.enabled);

  return (
    <form className="mt-6 space-y-4 text-left" onSubmit={(e) => e.preventDefault()}>
      {fields.map((field) => {
        if (field.key === 'attendance') {
          return (
            <div key={field.key}>
              <p className="font-body text-xs font-medium text-[#6d625a]">
                Attendance {field.required && <span className="text-[#c45c5c]">*</span>}
              </p>
              {field.helpText && (
                <p className="mt-0.5 font-body text-[10px] text-[#9e8e82]">{field.helpText}</p>
              )}
              <div className="mt-2 space-y-2">
                {enabledAttendance.map((option) => (
                  <label
                    key={option.key}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e8dfd6]/80 bg-white/60 px-3 py-2.5 backdrop-blur-sm transition-colors hover:border-[#c5a67c]/50"
                  >
                    <input type="radio" name="attendance" readOnly className="accent-[#c5a67c]" />
                    <span className="font-body text-sm text-[#4e342e]">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        }

        if (field.key === 'mealPreference' && rsvp.meals.length > 0) {
          return (
            <div key={field.key}>
              <p className="font-body text-xs font-medium text-[#6d625a]">
                Meal Preference {field.required && <span className="text-[#c45c5c]">*</span>}
              </p>
              <select
                readOnly
                className="mt-1.5 h-11 w-full rounded-xl border border-[#e8dfd6] bg-white/70 px-3 font-body text-sm backdrop-blur-sm"
                style={{ fontSize: `${rsvp.bodyFontSize}px` }}
              >
                <option>{field.placeholder || 'Select a meal'}</option>
                {rsvp.meals.map((meal) => (
                  <option key={meal.id}>{meal.label}</option>
                ))}
              </select>
            </div>
          );
        }

        if (field.key === 'dietaryRestrictions' && rsvp.dietaryOptions.length > 0) {
          return (
            <div key={field.key}>
              <p className="font-body text-xs font-medium text-[#6d625a]">Dietary Restrictions</p>
              {field.helpText && (
                <p className="mt-0.5 font-body text-[10px] text-[#9e8e82]">{field.helpText}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {rsvp.dietaryOptions.map((option) => (
                  <span
                    key={option.id}
                    className="rounded-full border border-[#e8dfd6] bg-white/70 px-2.5 py-1 font-body text-[10px] text-[#6d625a]"
                  >
                    {option.label}
                  </span>
                ))}
              </div>
            </div>
          );
        }

        if (field.key === 'plusOne' && !rsvp.plusOne.enabled) return null;

        const label = field.key === 'guestName' ? 'Guest Name' : field.key === 'email' ? 'Email' : field.key === 'phone' ? 'Phone' : field.key === 'guestCount' ? 'Number of Guests' : field.key === 'plusOne' ? "Plus One's Name" : field.key === 'songRequest' ? 'Song Request' : field.key === 'personalMessage' ? 'Message' : 'Special Requirements';

        return (
          <div key={field.key}>
            <p className="font-body text-xs font-medium text-[#6d625a]">
              {label} {field.required && <span className="text-[#c45c5c]">*</span>}
            </p>
            {field.helpText && (
              <p className="mt-0.5 font-body text-[10px] text-[#9e8e82]">{field.helpText}</p>
            )}
            <div className="mt-1.5">
              <PreviewInput
                rsvp={rsvp}
                placeholder={field.placeholder}
                type={field.key === 'email' ? 'email' : field.key === 'phone' ? 'tel' : 'text'}
                multiline={field.key === 'personalMessage' || field.key === 'specialRequirements'}
              />
            </div>
          </div>
        );
      })}

      {rsvp.songRequest.enabled && fields.some((field) => field.key === 'songRequest') && (
        <p className="font-body text-[10px] text-[#9e8e82]">
          Max {rsvp.songRequest.maxCharacters} characters
        </p>
      )}

      <button
        type="button"
        className={cn(
          'mt-2 w-full py-3 font-body text-sm font-semibold text-white transition-transform',
          rsvpButtonHoverClass(rsvp.button.hoverAnimation),
          rsvp.buttonStyle === 'outline' && 'border-2 bg-transparent',
          rsvp.buttonStyle === 'ghost' && 'bg-transparent',
        )}
        style={{
          backgroundColor: rsvp.buttonStyle === 'solid' ? rsvp.button.color : 'transparent',
          borderColor: rsvp.button.color,
          color: rsvp.buttonStyle === 'solid' ? '#fff' : rsvp.button.color,
          borderRadius: rsvp.button.borderRadius,
        }}
      >
        {rsvp.button.text}
      </button>

      {rsvp.allowEditBeforeDeadline && (
        <p className="text-center font-body text-[10px] text-[#9e8e82]">
          You may edit your RSVP before the deadline.
        </p>
      )}
    </form>
  );
}

function RsvpSuccessPreview({ rsvp }: { rsvp: RsvpDetailsContent }) {
  return (
    <div className="rsvp-success-reveal mt-8 px-2 text-center">
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: `${rsvp.accentColor}20` }}
      >
        <CheckCircle2 className="h-8 w-8 rsvp-success-icon" style={{ color: rsvp.accentColor }} />
      </div>
      <p
        className="mt-5 font-display leading-tight"
        style={{ fontSize: `${rsvp.headingFontSize}px`, color: '#4e342e', fontFamily: rsvp.fontFamily }}
      >
        {rsvp.thankYouTitle}
      </p>
      <p
        className="mx-auto mt-3 max-w-[240px] font-body leading-relaxed opacity-80"
        style={{ fontSize: `${rsvp.bodyFontSize}px`, color: '#6d625a' }}
      >
        {rsvp.thankYouMessage}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {rsvp.successScreen.showAddToCalendar && rsvp.calendar.google && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e8dfd6] bg-white/70 px-3 py-1.5 font-body text-[10px] text-[#6d625a] backdrop-blur-sm">
            <Calendar className="h-3.5 w-3.5" />
            Add to Calendar
          </span>
        )}
        {rsvp.successScreen.showDownloadInvitation && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e8dfd6] bg-white/70 px-3 py-1.5 font-body text-[10px] text-[#6d625a] backdrop-blur-sm">
            <Download className="h-3.5 w-3.5" />
            Download
          </span>
        )}
        {rsvp.successScreen.showQrCode && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e8dfd6] bg-white/70 px-3 py-1.5 font-body text-[10px] text-[#6d625a] backdrop-blur-sm">
            <QrCode className="h-3.5 w-3.5" />
            QR Code
          </span>
        )}
      </div>
    </div>
  );
}

export function RsvpSectionPreview({ section, invitation, analytics }: RsvpSectionPreviewProps) {
  const rsvp = parseRsvpDetails(section, invitation);
  const showSuccess = rsvp.previewVariant === 'success';

  return (
    <section
      className="relative overflow-hidden text-center rsvp-fade-in"
      style={{
        backgroundColor: rsvp.backgroundColor,
        borderRadius: rsvp.borderRadius,
        padding: rsvp.sectionPadding,
      }}
    >
      {rsvp.backgroundImageUrl && (
        <img src={rsvp.backgroundImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      {rsvp.backgroundImageUrl && rsvp.overlayOpacity > 0 && (
        <div className="absolute inset-0 bg-black" style={{ opacity: rsvp.overlayOpacity }} />
      )}

      <div className="relative z-10 mx-auto" style={{ width: rsvpWidthToCss(rsvp.sectionWidth) }}>
        <p
          className="font-display leading-tight"
          style={{
            fontFamily: rsvp.fontFamily,
            fontSize: `${rsvp.headingFontSize}px`,
            color: '#4e342e',
          }}
        >
          {rsvp.sectionTitle}
        </p>

        {rsvp.subtitle && (
          <p className="mt-2 font-body tracking-wide" style={{ fontSize: `${rsvp.bodyFontSize}px`, color: rsvp.accentColor }}>
            {rsvp.subtitle}
          </p>
        )}

        {rsvp.welcomeMessage && !showSuccess && (
          <p
            className="mx-auto mt-4 max-w-[260px] font-body leading-relaxed opacity-85"
            style={{ fontSize: `${rsvp.bodyFontSize}px`, color: '#6d625a' }}
          >
            {rsvp.welcomeMessage}
          </p>
        )}

        {rsvp.description && !showSuccess && (
          <p
            className="mx-auto mt-2 max-w-[260px] font-body text-xs leading-relaxed opacity-70"
            style={{ color: '#6d625a' }}
          >
            {rsvp.description}
          </p>
        )}

        {!showSuccess && <CountdownBlock rsvp={rsvp} />}

        {showSuccess ? <RsvpSuccessPreview rsvp={rsvp} /> : <RsvpFormPreview rsvp={rsvp} />}

        {analytics && !showSuccess && (
          <p className="mt-6 font-body text-[9px] uppercase tracking-wider text-[#9e8e82]">
            {analytics.summary.guestsResponded} of {analytics.summary.totalGuests} responded
          </p>
        )}
      </div>
    </section>
  );
}
