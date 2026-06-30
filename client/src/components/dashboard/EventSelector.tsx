import { ChevronDown } from 'lucide-react';
import type { Event } from '@/types/api';

interface EventSelectorProps {
  events: Event[];
  value: string | null;
  onChange: (eventId: string) => void;
  disabled?: boolean;
}

export function eventDisplayName(event: Event) {
  if (event.partnerOne && event.partnerTwo) {
    return `${event.partnerOne} & ${event.partnerTwo}`;
  }
  return event.title;
}

export function EventSelector({ events, value, onChange, disabled }: EventSelectorProps) {
  return (
    <div className="relative w-full max-w-sm">
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || events.length === 0}
        className="h-10 w-full appearance-none rounded-lg border border-[#e8dfd6] bg-white py-2 pl-4 pr-10 font-body text-sm text-[#4e342e] outline-none transition-colors focus:border-[#c5a67c] disabled:opacity-50"
        aria-label="Select event"
      >
        {events.length === 0 ? (
          <option value="">No events available</option>
        ) : (
          events.map((event) => (
            <option key={event.id} value={event.id}>
              {eventDisplayName(event)}
            </option>
          ))
        )}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9e8e82]"
        aria-hidden
      />
    </div>
  );
}
