import { useCallback, useEffect, useRef, useState } from 'react';
import { FileImage, Loader2, Trash2, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { DashboardMessage } from '@/components/dashboard/DashboardMessage';
import { EventSelector } from '@/components/dashboard/EventSelector';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/Toast';
import {
  deleteEventMedia,
  listEventMedia,
  uploadEventMediaWithProgress,
  type MediaAsset,
} from '@/api/media';
import { useSelectedEvent } from '@/hooks/useSelectedEvent';
import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/gif,video/mp4,application/pdf';

function formatFileSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageAsset(asset: MediaAsset) {
  return asset.mimeType.startsWith('image/') || asset.assetType === 'image';
}

export function MediaPage() {
  const { toast, showToast } = useToast();
  const {
    events,
    eventId,
    selectedEvent,
    selectEvent,
    loading: eventsLoading,
    error: eventsError,
  } = useSelectedEvent();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadMedia = useCallback(async () => {
    if (!eventId) {
      setAssets([]);
      return;
    }

    setPageLoading(true);
    setPageError(null);
    try {
      const data = await listEventMedia(eventId);
      setAssets(data);
    } catch (err) {
      setPageError(err instanceof ApiError ? err.message : 'Failed to load media.');
      setAssets([]);
    } finally {
      setPageLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void loadMedia();
  }, [loadMedia]);

  const handleUploadClick = () => {
    if (!eventId) {
      showToast('Select an event before uploading.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (!eventId || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setPageError(null);

    const uploaded: MediaAsset[] = [];
    let failed = 0;

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      try {
        const asset = await uploadEventMediaWithProgress(eventId, file, (percent) => {
          const overall = Math.round(((index + percent / 100) / files.length) * 100);
          setUploadProgress(overall);
        });
        uploaded.push(asset);
      } catch (err) {
        failed += 1;
        const message =
          err instanceof ApiError ? err.message : `Failed to upload ${file.name}.`;
        setPageError(message);
      }
    }

    if (uploaded.length > 0) {
      setAssets((prev) => [...uploaded, ...prev]);
      showToast(
        uploaded.length === 1
          ? 'Photo uploaded successfully.'
          : `${uploaded.length} files uploaded successfully.`,
      );
    }

    if (failed > 0 && uploaded.length === 0) {
      showToast('Upload failed. Please try again.');
    }

    setUploading(false);
    setUploadProgress(null);
  };

  const handleDelete = async (asset: MediaAsset) => {
    if (!eventId) return;
    const confirmed = window.confirm(`Delete "${asset.fileName}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(asset.id);
    try {
      await deleteEventMedia(eventId, asset.id);
      setAssets((prev) => prev.filter((item) => item.id !== asset.id));
      showToast('Media deleted.');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to delete media.');
    } finally {
      setDeletingId(null);
    }
  };

  const noEvents = !eventsLoading && events.length === 0;
  const uploadDisabled = !eventId || uploading || eventsLoading;

  return (
    <DashboardLayout headerVariant="search">
      <Toast message={toast} />

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        multiple
        className="hidden"
        onChange={(event) => void handleFilesSelected(event)}
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl text-[#705639] md:text-4xl">Media Gallery</h1>
          <p className="mt-2 font-body text-sm leading-relaxed text-[#6d625a] md:text-base">
            Curate your perfect moments. Organize, view, and select the finest images for your
            wedding narrative.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <EventSelector
            events={events}
            value={eventId}
            onChange={selectEvent}
            disabled={eventsLoading}
          />
          <Button
            type="button"
            onClick={handleUploadClick}
            disabled={uploadDisabled}
            className="h-10 rounded-lg bg-[#705639] px-5 font-body text-sm font-medium text-white hover:bg-[#4e342e] disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
            ) : (
              <Upload className="h-4 w-4" strokeWidth={1.5} />
            )}
            {uploading ? 'Uploading…' : 'Upload Photos'}
          </Button>
        </div>
      </div>

      {uploadProgress !== null && (
        <div className="mt-6 max-w-md">
          <div className="flex items-center justify-between font-body text-xs text-[#6d625a]">
            <span>Uploading…</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f0ebe6]">
            <div
              className="h-full rounded-full bg-[#705639] transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {eventsError && (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700">
          {eventsError}
        </p>
      )}

      {pageError && (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700">
          {pageError}
        </p>
      )}

      <div className="mt-8">
        {noEvents ? (
          <DashboardMessage
            title="No events yet"
            message="Create an event first, then upload photos and videos for your celebration."
            actionLabel="Create Event"
            actionTo="/dashboard/events/new"
          />
        ) : !eventId ? (
          <DashboardMessage
            title="Select an event"
            message="Choose an event to view and manage its media library."
          />
        ) : pageLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#a1887f]" />
          </div>
        ) : assets.length === 0 ? (
          <DashboardMessage
            title="No media yet"
            message={`Upload photos and videos for ${selectedEvent?.title ?? 'this event'} using the Upload Photos button above.`}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {assets.map((asset) => (
              <article
                key={asset.id}
                className="group overflow-hidden rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#faf7f2]">
                  {isImageAsset(asset) ? (
                    <img
                      src={asset.fileUrl}
                      alt={asset.fileName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                      <FileImage className="h-10 w-10 text-[#a1887f]" strokeWidth={1.25} />
                      <p className="font-body text-xs text-[#6d625a]">{asset.mimeType}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => void handleDelete(asset)}
                    disabled={deletingId === asset.id}
                    className={cn(
                      'absolute right-2 top-2 rounded-lg bg-white/90 p-2 text-[#6d625a] opacity-0 shadow-sm transition-opacity hover:text-red-700 group-hover:opacity-100',
                      deletingId === asset.id && 'opacity-100',
                    )}
                    aria-label={`Delete ${asset.fileName}`}
                  >
                    {deletingId === asset.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="border-t border-[#f0ebe6] px-4 py-3">
                  <p className="truncate font-body text-sm text-[#4e342e]">{asset.fileName}</p>
                  {asset.fileSizeBytes ? (
                    <p className="mt-0.5 font-body text-xs text-[#9e8e82]">
                      {formatFileSize(asset.fileSizeBytes)}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {eventId && assets.length > 0 && (
        <p className="mt-8 font-body text-xs text-[#9e8e82]">
          Uploaded media can be used in your{' '}
          <Link to="/dashboard/invitations" className="text-[#705639] underline-offset-2 hover:underline">
            invitation gallery
          </Link>
          .
        </p>
      )}
    </DashboardLayout>
  );
}
