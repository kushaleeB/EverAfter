import { Upload } from 'lucide-react';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { DashboardMessage } from '@/components/dashboard/DashboardMessage';
import { Button } from '@/components/ui/button';

export function MediaPage() {
  return (
    <DashboardLayout headerVariant="search">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl text-[#705639] md:text-4xl">Media Gallery</h1>
          <p className="mt-2 font-body text-sm leading-relaxed text-[#6d625a] md:text-base">
            Curate your perfect moments. Organize, view, and select the finest images for your
            wedding narrative.
          </p>
        </div>

        <Button
          disabled
          className="h-10 rounded-lg bg-[#705639] px-5 font-body text-sm font-medium text-white opacity-60"
        >
          <Upload className="h-4 w-4" strokeWidth={1.5} />
          Upload Photos
        </Button>
      </div>

      <div className="mt-8">
        <DashboardMessage
          title="No media yet"
          message="Uploaded photos and videos for your events will appear here."
          actionLabel="View Events"
          actionTo="/dashboard/events"
        />
      </div>
    </DashboardLayout>
  );
}
