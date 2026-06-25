import { useState } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const timezones = [
  'Select Timezone',
  'America/New_York (EST)',
  'America/Chicago (CST)',
  'America/Denver (MST)',
  'America/Los_Angeles (PST)',
  'Europe/London (GMT)',
  'Europe/Paris (CET)',
  'Europe/Rome (CET)',
  'Asia/Tokyo (JST)',
  'Australia/Sydney (AEDT)',
];

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="relative flex items-center py-8">
      <div className="h-px flex-1 bg-[#e8dfd6]" />
      <span className="px-4 font-display text-lg text-[#4e342e]">{title}</span>
      <div className="h-px flex-1 bg-[#e8dfd6]" />
    </div>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9e8e82]"
    >
      {children}
    </label>
  );
}

export function CreateEventPage() {
  const [partnerOne, setPartnerOne] = useState('');
  const [partnerTwo, setPartnerTwo] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [timezone, setTimezone] = useState('');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Connect to POST /api/v1/events when backend integration is restored
    console.log('Event creation will be implemented later.');
  }

  function handleSaveDraft() {
    // TODO: Connect to draft save endpoint when backend integration is restored
    console.log('Save as draft will be implemented later.');
  }

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Top bar */}
      <header className="border-b border-[#e8dfd6] bg-white">
        <div className="relative mx-auto flex h-14 max-w-5xl items-center justify-center px-6">
          <Link
            to="/dashboard/events"
            className="absolute left-6 flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.12em] text-[#6d625a] transition-colors hover:text-[#4e342e]"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Link>
          <Link to="/dashboard" className="font-display text-xl text-[#4e342e]">
            EverAfter
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10 md:py-14">
        {/* Page title */}
        <div className="text-center">
          <h1 className="font-display text-4xl text-[#4e342e] md:text-5xl">New Event</h1>
          <p className="mx-auto mt-4 max-w-lg font-body text-sm leading-relaxed text-[#6d625a] md:text-base">
            Begin the journey of crafting your perfect celebration. Provide the foundational
            details below.
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-2xl bg-white px-6 py-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:px-10 md:py-10"
        >
          <SectionDivider title="The Couple" />

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="partnerOne">Partner One</FieldLabel>
              <Input
                id="partnerOne"
                placeholder="E.g., Eleanor"
                value={partnerOne}
                onChange={(e) => setPartnerOne(e.target.value)}
                className="mt-2 bg-white"
              />
            </div>
            <div>
              <FieldLabel htmlFor="partnerTwo">Partner Two</FieldLabel>
              <Input
                id="partnerTwo"
                placeholder="E.g., James"
                value={partnerTwo}
                onChange={(e) => setPartnerTwo(e.target.value)}
                className="mt-2 bg-white"
              />
            </div>
          </div>

          <div className="mt-5">
            <FieldLabel htmlFor="eventTitle">Event Title</FieldLabel>
            <Input
              id="eventTitle"
              placeholder="The Wedding of Eleanor & James"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="mt-2 bg-white"
            />
          </div>

          <SectionDivider title="The Date" />

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="eventDate">Select Date</FieldLabel>
              <Input
                id="eventDate"
                type="text"
                placeholder="MM/DD/YYYY"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="mt-2 bg-white"
              />
            </div>
            <div>
              <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
              <div className="relative mt-2">
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className={cn(
                    'h-11 w-full appearance-none rounded-lg border border-[#e8dfd6] bg-white px-4 py-3 font-body text-sm text-[#1f1b18] outline-none transition-colors focus:border-[#c5a67c]',
                    !timezone && 'text-[#9e8e82]',
                  )}
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz === 'Select Timezone' ? '' : tz} disabled={tz === 'Select Timezone'}>
                      {tz}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9e8e82]"
                  aria-hidden
                />
              </div>
            </div>
          </div>

          <SectionDivider title="The Venue" />

          <div className="space-y-5">
            <div>
              <FieldLabel htmlFor="venueName">Venue Name</FieldLabel>
              <Input
                id="venueName"
                placeholder="E.g., The Glasshouse Estate"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="mt-2 bg-white"
              />
            </div>
            <div>
              <FieldLabel htmlFor="venueAddress">Venue Address</FieldLabel>
              <Input
                id="venueAddress"
                placeholder="Street, City, Country"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                className="mt-2 bg-white"
              />
            </div>
          </div>

          <div className="mt-10 flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Button
              type="button"
              variant="ghost"
              onClick={handleSaveDraft}
              className="h-11 rounded-lg border border-[#c5a67c] bg-white px-6 font-body text-sm font-medium text-[#c5a67c] hover:bg-[#faf7f2]"
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              className="h-11 rounded-lg bg-[#c5a67c] px-8 font-body text-sm font-medium text-white hover:bg-[#b8956a]"
            >
              Create Event
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center font-body text-xs text-[#9e8e82]">
          You can always update these details later in Settings.
        </p>
      </div>
    </div>
  );
}
