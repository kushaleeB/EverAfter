import {
  Check,
  CloudUpload,
  FileText,
  Mail,
  MapPin,
  UserPlus,
  Users,
} from 'lucide-react';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';

const HERO_IMAGE = '/img/overview/Image.png';

const recentActivity = [
  {
    icon: Check,
    text: "Sarah Jenkins & Guest RSVP'd Attending",
    time: '2 hours ago',
  },
  {
    icon: Mail,
    text: 'Digital Invitations batch #2 sent successfully',
    time: 'Yesterday',
  },
];

const quickActions = [
  {
    title: 'Design Invitation',
    description: 'Open studio editor',
    icon: FileText,
  },
  {
    title: 'Manage Guest List',
    description: 'Import or add manually',
    icon: UserPlus,
  },
  {
    title: 'Upload Media',
    description: 'Add engagement photos',
    icon: CloudUpload,
  },
];

export function OverviewPage() {
  return (
    <DashboardLayout>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl">
        <img
          src={HERO_IMAGE}
          alt="Lake Como at sunset"
          className="aspect-[21/9] min-h-[280px] w-full object-cover md:min-h-[320px]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-lg rounded-2xl bg-white/95 px-6 py-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)] backdrop-blur-sm md:px-8 md:py-8">
            <span className="inline-block rounded-md bg-[#f5ebe3] px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-[#705639]">
              Upcoming Wedding
            </span>
            <h1 className="mt-4 font-display text-3xl text-[#4e342e] md:text-4xl">
              Eleanor &amp; James
            </h1>
            <div className="mt-3 flex items-center gap-2 font-body text-sm text-[#6d625a]">
              <MapPin className="h-4 w-4 shrink-0 text-[#a1887f]" strokeWidth={1.5} />
              Villa del Balbianello, Lake Como, Italy
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#e8dfd6] bg-white px-4 py-3 text-center">
                <p className="font-display text-2xl text-[#4e342e]">142</p>
                <p className="mt-0.5 font-body text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9e8e82]">
                  Days to Go
                </p>
              </div>
              <div className="rounded-xl border border-[#e8dfd6] bg-white px-4 py-3 text-center">
                <p className="font-display text-lg text-[#4e342e]">Oct 12</p>
                <p className="mt-0.5 font-body text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9e8e82]">
                  2025
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <article className="rounded-xl bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-body text-xs text-[#9e8e82]">Total Guests</p>
              <p className="mt-2 font-display text-3xl text-[#4e342e]">250</p>
              <p className="mt-1 font-body text-sm text-[#6d625a]">Invited</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5ebe3]">
              <Users className="h-5 w-5 text-[#705639]" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#f5ebe3]">
            <div className="h-full w-[68%] rounded-full bg-[#4e342e]" />
          </div>
        </article>

        <article className="rounded-xl bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-body text-xs text-[#9e8e82]">RSVP Rate</p>
              <p className="mt-2 font-display text-3xl text-[#4e342e]">68%</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5ebe3]">
              <Mail className="h-5 w-5 text-[#705639]" strokeWidth={1.5} />
            </div>
          </div>
          <div className="mt-5 flex gap-6 font-body text-sm">
            <div>
              <span className="font-semibold text-[#4e342e]">170</span>
              <span className="ml-1 text-[#6d625a]">Accepted</span>
            </div>
            <div>
              <span className="font-semibold text-[#c45c5c]">12</span>
              <span className="ml-1 text-[#6d625a]">Declined</span>
            </div>
          </div>
        </article>
      </section>

      {/* Bottom grid */}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <article className="rounded-xl bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <h2 className="font-body text-sm font-semibold text-[#4e342e]">Recent Activity</h2>
            <button
              type="button"
              className="font-body text-xs font-medium text-[#c5a67c] transition-colors hover:text-[#4e342e]"
            >
              View All
            </button>
          </div>

          <ul className="mt-5 space-y-4">
            {recentActivity.map((item) => (
              <li key={item.text} className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#faf7f2]">
                  <item.icon className="h-4 w-4 text-[#705639]" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-body text-sm text-[#4e342e]">{item.text}</p>
                  <p className="mt-0.5 font-body text-xs text-[#9e8e82]">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>

        {/* Quick Actions */}
        <article className="rounded-xl bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <h2 className="font-body text-sm font-semibold text-[#4e342e]">Quick Actions</h2>
          <div className="mt-4 space-y-3">
            {quickActions.map(({ title, description, icon: Icon }) => (
              <button
                key={title}
                type="button"
                className="flex w-full items-center gap-4 rounded-xl border border-[#e8dfd6] bg-[#faf9f6] px-4 py-4 text-left transition-colors hover:bg-[#faf7f2]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
                  <Icon className="h-5 w-5 text-[#705639]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-body text-sm font-medium text-[#4e342e]">{title}</p>
                  <p className="mt-0.5 font-body text-xs text-[#9e8e82]">{description}</p>
                </div>
              </button>
            ))}
          </div>
        </article>
      </section>
    </DashboardLayout>
  );
}
