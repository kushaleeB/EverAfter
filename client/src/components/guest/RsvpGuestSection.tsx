import { useState } from 'react';
import { publicApi } from '@/api/public';
import { GuestSuccessScreen } from '@/components/guest/GuestSuccessScreen';
import { ApiError } from '@/lib/api';
import { parseRsvpDetails, rsvpButtonHoverClass, rsvpWidthToCss, visibleFormFields } from '@/lib/rsvpSection';
import { cn } from '@/lib/utils';
import type { Invitation, InvitationSection } from '@/types/api';
import type { PublicGuest } from '@/types/public';

interface RsvpGuestSectionProps {
  section: InvitationSection;
  invitation: Invitation;
  accessToken: string;
  guest: PublicGuest;
  initialResponded?: boolean;
}

type AttendanceValue = 'attending' | 'declined' | 'maybe';

export function RsvpGuestSection({
  section,
  invitation,
  accessToken,
  guest,
  initialResponded = false,
}: RsvpGuestSectionProps) {
  const rsvp = parseRsvpDetails(section, invitation);
  const fields = visibleFormFields(rsvp);
  const enabledAttendance = rsvp.attendanceOptions.filter((option) => option.enabled);

  const [submitted, setSubmitted] = useState(initialResponded);
  const [status, setStatus] = useState<AttendanceValue>('attending');
  const [attendingCount, setAttendingCount] = useState(Math.min(1, guest.partySize));
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [message, setMessage] = useState('');
  const [mealPreference, setMealPreference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (submitted) {
    return (
      <GuestSuccessScreen
        slug={invitation.slug}
        accessToken={accessToken}
        invitation={invitation}
      />
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const dietaryField = fields.find((field) => field.key === 'dietaryRestrictions');
    const mealField = fields.find((field) => field.key === 'mealPreference');
    const notes = [
      mealField && mealPreference ? `Meal: ${mealPreference}` : null,
      dietaryField && dietaryNotes ? dietaryNotes : null,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await publicApi.submitRsvp(invitation.slug, {
        accessToken,
        status,
        attendingCount: status === 'attending' ? attendingCount : 0,
        dietaryNotes: notes || undefined,
        message: message.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to submit your RSVP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

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
          className="font-display leading-tight text-[#4e342e]"
          style={{ fontFamily: rsvp.fontFamily, fontSize: `${rsvp.headingFontSize}px` }}
        >
          {rsvp.sectionTitle}
        </p>

        {rsvp.welcomeMessage && (
          <p
            className="mx-auto mt-4 max-w-md font-body leading-relaxed text-[#6d625a]"
            style={{ fontSize: `${rsvp.bodyFontSize}px` }}
          >
            {rsvp.welcomeMessage}
          </p>
        )}

        <form className="mt-6 space-y-4 text-left" onSubmit={handleSubmit}>
          {fields.map((field) => {
            if (field.key === 'attendance') {
              return (
                <div key={field.key}>
                  <p className="font-body text-xs font-medium text-[#6d625a]">
                    Attendance {field.required && <span className="text-[#c45c5c]">*</span>}
                  </p>
                  <div className="mt-2 space-y-2">
                    {enabledAttendance.map((option) => (
                      <label
                        key={option.key}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e8dfd6]/80 bg-white/80 px-3 py-2.5"
                      >
                        <input
                          type="radio"
                          name="attendance"
                          value={option.key}
                          checked={status === option.key}
                          onChange={() => setStatus(option.key as AttendanceValue)}
                          className="accent-[#c5a67c]"
                        />
                        <span className="font-body text-sm text-[#4e342e]">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            }

            if (field.key === 'plusOne' && status === 'attending' && guest.partySize > 1) {
              return (
                <div key={field.key}>
                  <label className="font-body text-xs font-medium text-[#6d625a]">
                    Number attending (max {guest.partySize})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={guest.partySize}
                    value={attendingCount}
                    onChange={(e) => setAttendingCount(Number(e.target.value))}
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#e8dfd6] bg-white px-3 font-body text-sm"
                  />
                </div>
              );
            }

            if (field.key === 'mealPreference' && rsvp.meals.length > 0) {
              return (
                <div key={field.key}>
                  <label className="font-body text-xs font-medium text-[#6d625a]">Meal Preference</label>
                  <select
                    value={mealPreference}
                    onChange={(e) => setMealPreference(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-[#e8dfd6] bg-white px-3 font-body text-sm"
                  >
                    <option value="">{field.placeholder || 'Select a meal'}</option>
                    {rsvp.meals.map((meal) => (
                      <option key={meal.id} value={meal.label}>
                        {meal.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            if (field.key === 'dietaryRestrictions') {
              return (
                <div key={field.key}>
                  <label className="font-body text-xs font-medium text-[#6d625a]">Dietary Restrictions</label>
                  <textarea
                    rows={3}
                    value={dietaryNotes}
                    onChange={(e) => setDietaryNotes(e.target.value)}
                    placeholder={field.placeholder || 'Let us know about allergies or dietary needs'}
                    className="mt-1.5 w-full rounded-xl border border-[#e8dfd6] bg-white px-3 py-2.5 font-body text-sm"
                  />
                </div>
              );
            }

            if (field.key === 'message') {
              return (
                <div key={field.key}>
                  <label className="font-body text-xs font-medium text-[#6d625a]">Message to the couple</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={field.placeholder || 'Share a note with the couple'}
                    className="mt-1.5 w-full rounded-xl border border-[#e8dfd6] bg-white px-3 py-2.5 font-body text-sm"
                  />
                </div>
              );
            }

            return null;
          })}

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 font-body text-xs text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'mt-2 w-full py-3 font-body text-sm font-semibold text-white transition-transform disabled:opacity-60',
              rsvpButtonHoverClass(rsvp.button.hoverAnimation),
            )}
            style={{
              backgroundColor: rsvp.buttonStyle === 'solid' ? rsvp.button.color : 'transparent',
              borderColor: rsvp.button.color,
              color: rsvp.buttonStyle === 'solid' ? '#fff' : rsvp.button.color,
              borderRadius: rsvp.button.borderRadius,
              borderWidth: rsvp.buttonStyle === 'outline' ? 2 : 0,
            }}
          >
            {isSubmitting ? 'Submitting...' : rsvp.button.text}
          </button>
        </form>
      </div>
    </section>
  );
}
