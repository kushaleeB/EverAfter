import {
  ArrowRight,
  Calendar,
  Check,
  MapPin,
  PartyPopper,
  UserPlus,
} from 'lucide-react';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const stats = [
  { label: 'Total Events', value: '2' },
  { label: 'Invitations Published', value: '1' },
  { label: 'Total Guests', value: '156' },
  { label: 'RSVP Response Rate', value: '71%' },
];

const tasks = [
  {
    when: 'Today',
    title: 'Finalize menu selection',
    detail: 'Waiting on caterer confirmation',
  },
  {
    when: 'In 2 Days',
    title: 'Send RSVP reminders',
    detail: null,
  },
  {
    when: 'Next Week',
    title: 'Floral arrangement walkthrough',
    detail: 'Meeting at the venue at 2:00 PM',
  },
];

const quickActions = [
  { label: 'Create Event', icon: PartyPopper },
  { label: 'Create Invitation', icon: Calendar },
  { label: 'Add Guests', icon: UserPlus },
];

const checklist = [
  { label: 'Book Photographer', done: false },
  { label: 'Order Cake Tasting Box', done: false },
  { label: 'Secure Venue Deposit', done: true },
];

export function DashboardPage() {
  return (
    <DashboardLayout>
      {/* Welcome banner */}
      <section className="rounded-2xl bg-[#f5ebe3]/60 px-6 py-8 md:px-10 md:py-10">
        <h1 className="font-display text-3xl text-[#4e342e] md:text-4xl">
          Welcome back, Sarah &amp; Daniel
        </h1>
        <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-[#6d625a] md:text-base">
          Your forever story is beautifully coming together. Here is an overview of your progress.
        </p>
      </section>

      {/* Stats */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-xl bg-white px-5 py-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
          >
            <p className="font-body text-xs text-[#9e8e82]">{stat.label}</p>
            <p className="mt-2 font-display text-3xl text-[#4e342e]">{stat.value}</p>
          </article>
        ))}
      </section>

      {/* Bottom grid */}
      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Recent Events */}
        <article className="overflow-hidden rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <h2 className="px-5 pt-5 font-body text-sm font-semibold text-[#4e342e]">
            Recent Events
          </h2>
          <div className="mt-4 px-5 pb-5">
            <div className="relative overflow-hidden rounded-xl">
              <img
                src="/img/dashboard/lake.png"
                alt="Lake Como wedding venue"
                className="aspect-[16/10] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5">
                <p className="font-body text-[10px] font-semibold uppercase tracking-[0.15em] text-white/80">
                  Wedding Ceremony
                </p>
                <p className="mt-1 font-display text-xl text-white md:text-2xl">
                  Elena &amp; David&apos;s Wedding
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 font-body text-sm text-[#6d625a]">
                <Calendar className="h-4 w-4 text-[#a1887f]" strokeWidth={1.5} />
                Sept 24, 2024
              </div>
              <div className="flex items-center gap-2 font-body text-sm text-[#6d625a]">
                <MapPin className="h-4 w-4 text-[#a1887f]" strokeWidth={1.5} />
                Lake Como, Italy
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between font-body text-xs text-[#6d625a]">
                <span>Planning Progress</span>
                <span className="font-medium text-[#4e342e]">71%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#f5ebe3]">
                <div className="h-full w-[71%] rounded-full bg-[#c5a67c]" />
              </div>
            </div>
          </div>
        </article>

        {/* Upcoming Tasks */}
        <article className="rounded-xl bg-[#faf7f2] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <h2 className="font-body text-sm font-semibold text-[#4e342e]">Upcoming Tasks</h2>
          <ul className="mt-5 space-y-5">
            {tasks.map((task) => (
              <li key={task.title} className="border-l-2 border-[#e8dfd6] pl-4">
                <p className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a1887f]">
                  {task.when}
                </p>
                <p className="mt-1 font-body text-sm font-medium text-[#4e342e]">{task.title}</p>
                {task.detail && (
                  <p className="mt-0.5 font-body text-xs text-[#9e8e82]">{task.detail}</p>
                )}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-6 flex items-center gap-1 font-body text-sm font-medium text-[#705639] transition-colors hover:text-[#4e342e]"
          >
            View all tasks
            <ArrowRight className="h-4 w-4" />
          </button>
        </article>

        {/* Quick Actions & Checklist */}
        <div className="flex flex-col gap-6">
          <article className="rounded-xl bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <h2 className="font-body text-sm font-semibold text-[#4e342e]">Quick Actions</h2>
            <div className="mt-4 space-y-2">
              {quickActions.map(({ label, icon: Icon }) => (
                <Button
                  key={label}
                  variant="ghost"
                  className="h-11 w-full justify-start gap-3 rounded-lg border border-[#e8dfd6] bg-[#faf9f6] px-4 font-body text-sm font-medium text-[#4e342e] hover:bg-[#faf7f2]"
                >
                  <Icon className="h-4 w-4 text-[#705639]" strokeWidth={1.5} />
                  {label}
                </Button>
              ))}
            </div>
          </article>

          <article className="rounded-xl bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <h2 className="font-body text-sm font-semibold text-[#4e342e]">Checklist</h2>
            <ul className="mt-4 space-y-3">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                      item.done
                        ? 'border-[#705639] bg-[#705639] text-white'
                        : 'border-[#d9cfc6] bg-white',
                    )}
                  >
                    {item.done && <Check className="h-3 w-3" strokeWidth={2.5} />}
                  </span>
                  <span
                    className={cn(
                      'font-body text-sm',
                      item.done ? 'text-[#9e8e82] line-through' : 'text-[#4e342e]',
                    )}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </DashboardLayout>
  );
}
