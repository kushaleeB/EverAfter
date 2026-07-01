import { Calendar, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { downloadIcsFile, generateGoogleCalendarLink, type CalendarEventInfo } from '@/lib/calendar';

interface AddToCalendarButtonProps {
  event: CalendarEventInfo;
  className?: string;
}

export function AddToCalendarButton({ event, className }: AddToCalendarButtonProps) {
  const [open, setOpen] = useState(false);

  if (!event.startDate) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={
          className ??
          'inline-flex items-center justify-center gap-2 rounded-full border border-[#e8dfd6] bg-white px-4 py-2.5 font-body text-sm font-medium text-[#4e342e] transition-colors hover:border-[#c5a67c] hover:bg-[#faf7f2]'
        }
      >
        <Calendar className="h-4 w-4" />
        Add to Calendar
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10"
            aria-label="Close calendar menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-full left-1/2 z-20 mb-2 w-48 -translate-x-1/2 overflow-hidden rounded-xl border border-[#e8dfd6] bg-white shadow-lg">
            <a
              href={generateGoogleCalendarLink(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 font-body text-sm text-[#4e342e] hover:bg-[#faf7f2]"
              onClick={() => setOpen(false)}
            >
              Google Calendar
            </a>
            <button
              type="button"
              className="block w-full px-4 py-3 text-left font-body text-sm text-[#4e342e] hover:bg-[#faf7f2]"
              onClick={() => {
                downloadIcsFile(event);
                setOpen(false);
              }}
            >
              Apple Calendar (.ics)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
