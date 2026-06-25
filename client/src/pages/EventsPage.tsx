import { Calendar, MapPin, PartyPopper, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';

const events = [
  {
    id: 'elena-david',
    image: '/img/events/img_1.png',
    badge: 'Wedding',
    title: 'Elena & David',
    date: 'October 14, 2024',
    location: 'Villa Firenze, Tuscany, Italy',
    guests: { current: 120, max: 150 },
    rsvps: 85,
  },
  {
    id: 'sarah-michael',
    image: '/img/events/img_2.png',
    badge: 'Engagement',
    title: 'Sarah & Michael',
    date: 'December 02, 2024',
    location: 'The Glasshouse, New York',
    guests: { current: 40, max: 50 },
    rsvps: 32,
  },
];

function EventCard({
  image,
  badge,
  title,
  date,
  location,
  guests,
  rsvps,
}: (typeof events)[number]) {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <div className="relative">
        <img src={image} alt={title} className="aspect-[4/3] w-full object-cover" />
        <span className="absolute left-4 top-4 rounded-md bg-white/95 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4e342e]">
          {badge}
        </span>
      </div>

      <div className="p-5">
        <h2 className="font-display text-xl text-[#4e342e]">{title}</h2>

        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 font-body text-sm text-[#6d625a]">
            <Calendar className="h-4 w-4 shrink-0 text-[#a1887f]" strokeWidth={1.5} />
            {date}
          </div>
          <div className="flex items-center gap-2 font-body text-sm text-[#6d625a]">
            <MapPin className="h-4 w-4 shrink-0 text-[#a1887f]" strokeWidth={1.5} />
            {location}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-[#f0e6e1] pt-4">
          <div>
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9e8e82]">
              Guests
            </p>
            <p className="mt-0.5 font-body text-sm font-medium text-[#4e342e]">
              {guests.current} / {guests.max}
            </p>
          </div>
          <div className="text-right">
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9e8e82]">
              RSVPs
            </p>
            <p className="mt-0.5 font-body text-sm font-medium text-[#4e342e]">{rsvps}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function CreateEventCard() {
  return (
    <article className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#e8dfd6] bg-[#faf9f6] px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f5ebe3]">
        <PartyPopper className="h-6 w-6 text-[#c5a67c]" strokeWidth={1.5} />
      </div>
      <h2 className="mt-5 font-display text-xl text-[#4e342e]">Plan another celebration</h2>
      <p className="mt-2 max-w-xs font-body text-sm leading-relaxed text-[#6d625a]">
        Start organizing a new wedding, engagement party, or rehearsal dinner.
      </p>
      <Button
        variant="ghost"
        className="mt-6 h-11 rounded-lg border border-[#c5a67c] bg-white px-6 font-body text-sm font-medium text-[#4e342e] hover:bg-[#faf7f2]"
        asChild
      >
        <Link to="/dashboard/events/new">
          <Plus className="h-4 w-4" />
          Create Event
        </Link>
      </Button>
    </article>
  );
}

export function EventsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-[#4e342e] md:text-4xl">Your Events</h1>
          <p className="mt-2 font-body text-sm text-[#6d625a] md:text-base">
            Manage your upcoming celebrations.
          </p>
        </div>
        <Button className="h-11 shrink-0 rounded-lg bg-[#c5a67c] px-5 text-white hover:bg-[#b8956a]" asChild>
          <Link to="/dashboard/events/new">
            <Plus className="h-4 w-4" />
            Add New Event
          </Link>
        </Button>
      </div>

      <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} {...event} />
        ))}
        <CreateEventCard />
      </section>
    </DashboardLayout>
  );
}
