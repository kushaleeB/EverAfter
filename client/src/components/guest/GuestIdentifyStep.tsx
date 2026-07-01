import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { publicApi } from '@/api/public';
import { Input } from '@/components/ui/input';
import { formatGuestName } from '@/lib/guests';
import type { PublicGuestSearchResult } from '@/types/public';

interface GuestIdentifyStepProps {
  slug: string;
  onSelect: (guest: PublicGuestSearchResult) => void;
}

export function GuestIdentifyStep({ slug, onSelect }: GuestIdentifyStepProps) {
  const [query, setQuery] = useState('');
  const [guests, setGuests] = useState<PublicGuestSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      publicApi
        .searchGuests(slug, query)
        .then((results) => {
          if (!cancelled) setGuests(results);
        })
        .catch(() => {
          if (!cancelled) {
            setError('Unable to load guest list. Please try again.');
            setGuests([]);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, query ? 250 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [slug, query]);

  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-md text-center">
        <p className="font-display text-2xl text-[#4e342e]">Who are you?</p>
        <p className="mt-2 font-body text-sm leading-relaxed text-[#6d625a]">
          Search for your name to continue with your RSVP.
        </p>

        <div className="relative mt-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9e8e82]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your name..."
            className="h-11 pl-9 text-left"
            autoComplete="name"
          />
        </div>

        <div className="mt-4 max-h-64 overflow-y-auto rounded-2xl border border-[#e8dfd6] bg-white text-left shadow-sm">
          {loading && (
            <p className="px-4 py-6 text-center font-body text-sm text-[#6d625a]">Loading guests...</p>
          )}
          {!loading && error && (
            <p className="px-4 py-6 text-center font-body text-sm text-red-600">{error}</p>
          )}
          {!loading && !error && guests.length === 0 && (
            <p className="px-4 py-6 text-center font-body text-sm text-[#6d625a]">
              No matching guests found.
            </p>
          )}
          {!loading &&
            !error &&
            guests.map((guest) => (
              <button
                key={guest.id}
                type="button"
                onClick={() => onSelect(guest)}
                className="flex w-full items-center justify-between border-b border-[#f0ebe6] px-4 py-3 text-left font-body text-sm text-[#4e342e] transition-colors last:border-0 hover:bg-[#faf7f2]"
              >
                <span>{formatGuestName(guest.firstName, guest.lastName)}</span>
                <span className="text-xs text-[#9e8e82]">Select</span>
              </button>
            ))}
        </div>
      </div>
    </section>
  );
}
