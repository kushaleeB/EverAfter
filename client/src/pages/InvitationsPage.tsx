import { useState } from 'react';
import { ChevronDown, Eye, Mail, MoreVertical, Plus } from 'lucide-react';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { cn } from '@/lib/utils';

const statusOptions = ['All Statuses', 'Published', 'Draft'];
const templateOptions = ['All Templates', 'Minimalist', 'Botanical', 'Velvet', 'Classic'];

const invitations = [
  {
    id: 'minimalist',
    image: '/img/invitations/card_1.png',
    title: 'The Minimalist Serif',
    subtitle: 'Main Invitation & RSVP',
    status: 'published' as const,
    views: 284,
    sent: 156,
    meta: 'Oct 12, 2023',
  },
  {
    id: 'botanical',
    image: '/img/invitations/card_2.png',
    title: 'Botanical Garden',
    subtitle: 'Save the Date',
    status: 'published' as const,
    views: 412,
    sent: 198,
    meta: 'Sep 28, 2023',
  },
  {
    id: 'velvet',
    image: '/img/invitations/card_3.png',
    title: 'Midnight Velvet',
    subtitle: 'Rehearsal Dinner',
    status: 'draft' as const,
    views: 12,
    sent: 0,
    meta: 'Edited 2h ago',
  },
];

function FilterSelect({
  value,
  onChange,
  options,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  id: string;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 appearance-none rounded-lg border border-[#e8dfd6] bg-white py-2 pl-4 pr-10 font-body text-sm text-[#4e342e] outline-none transition-colors focus:border-[#c5a67c]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9e8e82]"
        aria-hidden
      />
    </div>
  );
}

function StatusBadge({ status }: { status: 'published' | 'draft' }) {
  return (
    <span
      className={cn(
        'rounded-md px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.1em]',
        status === 'published'
          ? 'bg-[#e8f5e9] text-[#2e7d4f]'
          : 'bg-[#fceee6] text-[#b86b4a]',
      )}
    >
      {status === 'published' ? 'Published' : 'Draft'}
    </span>
  );
}

function InvitationCard({
  image,
  title,
  subtitle,
  status,
  views,
  sent,
  meta,
}: (typeof invitations)[number]) {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <div className="relative">
        <img src={image} alt={title} className="aspect-[4/3] w-full object-cover" />
        <div className="absolute left-4 top-4">
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-display text-lg text-[#4e342e]">{title}</h2>
            <p className="mt-1 font-body text-sm text-[#9e8e82]">{subtitle}</p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg p-1.5 text-[#9e8e82] transition-colors hover:bg-[#faf7f2] hover:text-[#4e342e]"
            aria-label={`Options for ${title}`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#f0e6e1] pt-4 font-body text-xs text-[#9e8e82]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
              {views}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
              {sent}
            </span>
          </div>
          <span>{meta}</span>
        </div>
      </div>
    </article>
  );
}

function CreateSuiteCard() {
  return (
    <article className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#e8dfd6] bg-[#faf9f6] px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#f5ebe3]">
        <Plus className="h-6 w-6 text-[#c5a67c]" strokeWidth={1.5} />
      </div>
      <h2 className="mt-5 font-display text-xl text-[#4e342e]">Create New Suite</h2>
      <p className="mt-2 max-w-xs font-body text-sm leading-relaxed text-[#6d625a]">
        Start with a blank canvas or choose from our curated templates.
      </p>
    </article>
  );
}

export function InvitationsPage() {
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [templateFilter, setTemplateFilter] = useState('All Templates');

  const filtered = invitations.filter((inv) => {
    const matchesStatus =
      statusFilter === 'All Statuses' ||
      inv.status === statusFilter.toLowerCase();
    const matchesTemplate =
      templateFilter === 'All Templates' ||
      inv.title.toLowerCase().includes(templateFilter.toLowerCase());
    return matchesStatus && matchesTemplate;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl text-[#4e342e] md:text-4xl">Digital Invitations</h1>
          <p className="mt-2 font-body text-sm leading-relaxed text-[#6d625a] md:text-base">
            Manage your bespoke digital suites. Craft elegant experiences for your guests from
            save-the-dates to final RSVPs.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <FilterSelect
            id="status-filter"
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
          />
          <FilterSelect
            id="template-filter"
            value={templateFilter}
            onChange={setTemplateFilter}
            options={templateOptions}
          />
        </div>
      </div>

      <section className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <CreateSuiteCard />
        {filtered.map((invitation) => (
          <InvitationCard key={invitation.id} {...invitation} />
        ))}
      </section>
    </DashboardLayout>
  );
}
