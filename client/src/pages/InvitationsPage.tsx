import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { DashboardMessage } from '@/components/dashboard/DashboardMessage';

export function InvitationsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl text-[#4e342e] md:text-4xl">Digital Invitations</h1>
        <p className="mt-2 font-body text-sm leading-relaxed text-[#6d625a] md:text-base">
          Manage your bespoke digital suites. Craft elegant experiences for your guests from
          save-the-dates to final RSVPs.
        </p>
      </div>

      <div className="mt-8">
        <DashboardMessage
          title="No invitations yet"
          message="Invitations for your events will appear here once you create them."
          actionLabel="View Events"
          actionTo="/dashboard/events"
        />
      </div>
    </DashboardLayout>
  );
}
