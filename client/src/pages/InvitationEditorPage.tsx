import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Eye, Send } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { listEvents } from '@/api/events';
import { uploadEventMedia, uploadEventMediaWithProgress } from '@/api/media';
import {
  getInvitation,
  getInvitationRsvpAnalytics,
  publishInvitation,
  updateInvitation,
  updateInvitationSection,
} from '@/api/invitations';
import { InvitationFlowSidebar } from '@/components/invitations/InvitationFlowSidebar';
import { InvitationPreview } from '@/components/invitations/InvitationPreview';
import { PublishValidationDialog } from '@/components/invitations/PublishValidationDialog';
import { SectionEditorPanel } from '@/components/invitations/SectionEditorPanel';
import type { GalleryEditorChange, GalleryUploadTarget } from '@/components/invitations/GallerySectionEditor';
import type { RsvpEditorChange, RsvpUploadTarget } from '@/components/invitations/RsvpSectionEditor';
import type { ScheduleEditorChange, ScheduleUploadTarget } from '@/components/invitations/ScheduleSectionEditor';
import type { StoryEditorChange, StoryImageUploadTarget } from '@/components/invitations/StorySectionEditor';
import { Button } from '@/components/ui/button';
import { eventDisplayName } from '@/components/dashboard/EventSelector';
import { ApiError } from '@/lib/api';
import type { HeroEditorChange } from '@/components/invitations/HeroSectionEditor';
import { heroDetailsToContent, parseHeroDetails, validateHeroDetails } from '@/lib/heroSection';
import {
  createGalleryImage,
  compressGalleryImage,
  galleryDetailsToContent,
  parseGalleryDetails,
  validateGalleryDetails,
  validateGalleryFile,
} from '@/lib/gallerySection';
import {
  parseScheduleDetails,
  scheduleDetailsToContent,
  validateScheduleDetails,
} from '@/lib/scheduleSection';
import {
  parseStoryDetails,
  storyDetailsToContent,
  validateStoryDetails,
  type StoryGalleryImage,
} from '@/lib/storySection';
import {
  buildValidationIssues,
  scrollToValidationField,
  sectionTypesWithIssues,
  type ValidationIssue,
} from '@/lib/invitationValidation';
import {
  parseRsvpDetails,
  rsvpDetailsToContent,
  validateRsvpDetails,
} from '@/lib/rsvpSection';
import type { Invitation, InvitationSection, RsvpAnalytics } from '@/types/api';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface PendingSave {
  invitation?: {
    headline?: string;
    subheadline?: string;
    bodyContent?: string;
    rsvpDeadline?: string | null;
  };
  sections: Map<string, Record<string, unknown>>;
}

function useDebouncedSave(delayMs: number) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const schedule = useCallback(
    (fn: () => void | Promise<void>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        void fn();
      }, delayMs);
    },
    [delayMs],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return schedule;
}

export function InvitationEditorPage() {
  const { invitationId } = useParams<{ invitationId: string }>();
  const location = useLocation();
  const eventIdHint = (location.state as { eventId?: string } | null)?.eventId ?? null;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [eventId, setEventId] = useState<string | null>(eventIdHint);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [rsvpAnalytics, setRsvpAnalytics] = useState<RsvpAnalytics | null>(null);
  const [rsvpAnalyticsLoading, setRsvpAnalyticsLoading] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationSuccessMessage, setValidationSuccessMessage] = useState<string | null>(null);
  const [forcedOpenPanels, setForcedOpenPanels] = useState<Set<string>>(new Set());
  const [forceExpandScheduleEventId, setForceExpandScheduleEventId] = useState<string | null>(null);

  const pendingSaveRef = useRef<PendingSave>({ sections: new Map() });
  const editorScrollRef = useRef<HTMLDivElement>(null);
  const scheduleSave = useDebouncedSave(500);

  const activeSection = useMemo(
    () => invitation?.sections?.find((section) => section.id === activeSectionId) ?? null,
    [invitation?.sections, activeSectionId],
  );

  const heroSection = useMemo(
    () => invitation?.sections?.find((section) => section.sectionType === 'hero') ?? null,
    [invitation?.sections],
  );

  const storySection = useMemo(
    () => invitation?.sections?.find((section) => section.sectionType === 'story') ?? null,
    [invitation?.sections],
  );

  const scheduleSection = useMemo(
    () => invitation?.sections?.find((section) => section.sectionType === 'schedule') ?? null,
    [invitation?.sections],
  );

  const gallerySection = useMemo(
    () => invitation?.sections?.find((section) => section.sectionType === 'gallery') ?? null,
    [invitation?.sections],
  );

  const rsvpSection = useMemo(
    () => invitation?.sections?.find((section) => section.sectionType === 'rsvp') ?? null,
    [invitation?.sections],
  );

  const heroValidation = useMemo(
    () =>
      invitation
        ? validateHeroDetails(invitation, heroSection ?? undefined)
        : { isValid: true, errors: {} },
    [invitation, heroSection],
  );

  const storyValidation = useMemo(
    () =>
      storySection
        ? validateStoryDetails(storySection)
        : { isValid: true, errors: {}, warnings: {} },
    [storySection],
  );

  const scheduleValidation = useMemo(
    () =>
      scheduleSection
        ? validateScheduleDetails(scheduleSection)
        : { isValid: true, errors: {} },
    [scheduleSection],
  );

  const galleryValidation = useMemo(
    () =>
      gallerySection
        ? validateGalleryDetails(gallerySection)
        : { isValid: true, errors: {} },
    [gallerySection],
  );

  const rsvpValidation = useMemo(
    () =>
      rsvpSection
        ? validateRsvpDetails(rsvpSection, invitation)
        : { isValid: true, errors: {} },
    [rsvpSection, invitation],
  );

  const validation = useMemo(
    () => ({
      isValid:
        heroValidation.isValid &&
        storyValidation.isValid &&
        scheduleValidation.isValid &&
        galleryValidation.isValid &&
        rsvpValidation.isValid,
      hero: heroValidation,
      story: storyValidation,
      schedule: scheduleValidation,
      gallery: galleryValidation,
      rsvp: rsvpValidation,
    }),
    [heroValidation, storyValidation, scheduleValidation, galleryValidation, rsvpValidation],
  );

  const validationIssues = useMemo(
    () => buildValidationIssues(invitation?.sections ?? [], validation),
    [invitation?.sections, validation],
  );

  const sectionsWithErrors = useMemo(
    () => (validationAttempted ? sectionTypesWithIssues(validationIssues) : new Set()),
    [validationAttempted, validationIssues],
  );

  useEffect(() => {
    if (!validationAttempted) return;
    if (validation.isValid) {
      setValidationSuccessMessage('All required fields are complete. You can publish your invitation.');
      const timer = window.setTimeout(() => setValidationSuccessMessage(null), 5000);
      return () => window.clearTimeout(timer);
    }
    setValidationSuccessMessage(null);
  }, [validationAttempted, validation.isValid]);

  const navigateToValidationIssue = useCallback((issue: ValidationIssue) => {
    setActiveSectionId(issue.sectionId);
    setValidationAttempted(true);
    setShowValidationDialog(false);

    if (issue.panelKey) {
      setForcedOpenPanels((current) => new Set([...current, issue.panelKey!]));
    }
    if (issue.expandEventId) {
      setForceExpandScheduleEventId(issue.expandEventId);
    }

    window.setTimeout(() => {
      scrollToValidationField(issue.id, editorScrollRef.current);
    }, 120);
  }, []);

  const autosaveLabel =
    saveStatus === 'saving'
      ? 'Saving...'
      : saveStatus === 'saved'
        ? 'Saved just now'
        : saveStatus === 'error'
          ? 'Save failed'
          : 'Autosaved just now';

  useEffect(() => {
    if (!invitationId) return;

    let cancelled = false;

    async function resolveInvitation() {
      setLoading(true);
      setError(null);

      const tryLoad = async (candidateEventId: string) => {
        return getInvitation(candidateEventId, invitationId!);
      };

      try {
        if (eventIdHint) {
          const data = await tryLoad(eventIdHint);
          if (!cancelled) {
            setInvitation(data);
            setEventId(data.eventId);
            setActiveSectionId(
              data.sections?.find((section) => section.sectionType === 'hero')?.id ??
                data.sections?.[0]?.id ??
                null,
            );
          }
          return;
        }

        const events = await listEvents();
        for (const event of events) {
          try {
            const data = await tryLoad(event.id);
            if (!cancelled) {
              setInvitation(data);
              setEventId(data.eventId);
              setActiveSectionId(
                data.sections?.find((section) => section.sectionType === 'hero')?.id ??
                  data.sections?.[0]?.id ??
                  null,
              );
            }
            return;
          } catch {
            // Try next event.
          }
        }

        if (!cancelled) {
          setError('Invitation not found.');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load invitation.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void resolveInvitation();

    return () => {
      cancelled = true;
    };
  }, [invitationId, eventIdHint]);

  useEffect(() => {
    if (!eventId || !invitation?.id || activeSection?.sectionType !== 'rsvp') return;

    let cancelled = false;
    setRsvpAnalyticsLoading(true);

    void getInvitationRsvpAnalytics(eventId, invitation.id)
      .then((data) => {
        if (!cancelled) setRsvpAnalytics(data);
      })
      .catch(() => {
        if (!cancelled) setRsvpAnalytics(null);
      })
      .finally(() => {
        if (!cancelled) setRsvpAnalyticsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId, invitation?.id, activeSection?.sectionType, saveStatus]);

  const flushSave = useCallback(async () => {
    if (!invitation || !eventId) return;

    const pending = pendingSaveRef.current;
    const hasInvitationUpdates = Boolean(pending.invitation);
    const sectionEntries = Array.from(pending.sections.entries());

    if (!hasInvitationUpdates && sectionEntries.length === 0) return;

    setSaveStatus('saving');
    setSaveError(null);

    try {
      let nextInvitation = invitation;

      if (pending.invitation) {
        const updated = await updateInvitation(eventId, invitation.id, pending.invitation);
        nextInvitation = { ...nextInvitation, ...updated, sections: nextInvitation.sections };
        pending.invitation = undefined;
      }

      for (const [sectionId, content] of sectionEntries) {
        await updateInvitationSection(eventId, invitation.id, sectionId, { content });
        pending.sections.delete(sectionId);
      }

      setInvitation((current) =>
        current ? { ...current, ...nextInvitation, sections: current.sections } : nextInvitation,
      );
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('error');
      setSaveError(err instanceof ApiError ? err.message : 'Failed to save changes.');
    }
  }, [invitation, eventId]);

  const queueSave = useCallback(() => {
    scheduleSave(() => flushSave());
  }, [scheduleSave, flushSave]);

  function applyLocalInvitation(updates: Partial<Invitation>) {
    setInvitation((current) => (current ? { ...current, ...updates } : current));
  }

  function applyLocalSection(sectionId: string, content: Record<string, unknown>) {
    setInvitation((current) => {
      if (!current?.sections) return current;
      return {
        ...current,
        sections: current.sections.map((section) =>
          section.id === sectionId ? { ...section, content } : section,
        ),
      };
    });
  }

  function handleInvitationChange(updates: Partial<Invitation>) {
    applyLocalInvitation(updates);
    pendingSaveRef.current.invitation = {
      ...pendingSaveRef.current.invitation,
      headline: updates.headline ?? pendingSaveRef.current.invitation?.headline,
      subheadline: updates.subheadline ?? pendingSaveRef.current.invitation?.subheadline,
      bodyContent: updates.bodyContent ?? pendingSaveRef.current.invitation?.bodyContent,
      rsvpDeadline:
        updates.rsvpDeadline !== undefined
          ? updates.rsvpDeadline
          : pendingSaveRef.current.invitation?.rsvpDeadline,
    };
    queueSave();
  }

  function handleSectionChange(sectionId: string, content: Record<string, unknown>) {
    applyLocalSection(sectionId, content);
    pendingSaveRef.current.sections.set(sectionId, content);
    queueSave();
  }

  function handleHeroChange(sectionId: string, patch: HeroEditorChange) {
    if (patch.headline !== undefined || patch.subheadline !== undefined) {
      handleInvitationChange({
        ...(patch.headline !== undefined ? { headline: patch.headline } : {}),
        ...(patch.subheadline !== undefined ? { subheadline: patch.subheadline } : {}),
      });
    }

    if (patch.content) {
      setInvitation((current) => {
        if (!current?.sections) return current;

        const section = current.sections.find((item) => item.id === sectionId);
        const merged = { ...(section?.content ?? {}), ...patch.content };

        pendingSaveRef.current.sections.set(sectionId, merged);
        queueSave();

        return {
          ...current,
          sections: current.sections.map((item) =>
            item.id === sectionId ? { ...item, content: merged } : item,
          ),
        };
      });
    }
  }

  function handleStoryChange(sectionId: string, patch: StoryEditorChange) {
    if (!patch.content) return;

    setInvitation((current) => {
      if (!current?.sections) return current;

      const section = current.sections.find((item) => item.id === sectionId);
      const parsed = parseStoryDetails(section);
      const merged = storyDetailsToContent({ ...parsed, ...patch.content });

      pendingSaveRef.current.sections.set(sectionId, merged);
      queueSave();

      return {
        ...current,
        sections: current.sections.map((item) =>
          item.id === sectionId ? { ...item, content: merged } : item,
        ),
      };
    });
  }

  function handleScheduleChange(sectionId: string, patch: ScheduleEditorChange) {
    if (!patch.content) return;

    setInvitation((current) => {
      if (!current?.sections) return current;

      const section = current.sections.find((item) => item.id === sectionId);
      const parsed = parseScheduleDetails(section);
      const merged = scheduleDetailsToContent({ ...parsed, ...patch.content });

      pendingSaveRef.current.sections.set(sectionId, merged);
      queueSave();

      return {
        ...current,
        sections: current.sections.map((item) =>
          item.id === sectionId ? { ...item, content: merged } : item,
        ),
      };
    });
  }

  function handleGalleryChange(sectionId: string, patch: GalleryEditorChange) {
    if (!patch.content) return;

    setInvitation((current) => {
      if (!current?.sections) return current;

      const section = current.sections.find((item) => item.id === sectionId);
      const parsed = parseGalleryDetails(section);
      const merged = galleryDetailsToContent({ ...parsed, ...patch.content });

      pendingSaveRef.current.sections.set(sectionId, merged);
      queueSave();

      return {
        ...current,
        sections: current.sections.map((item) =>
          item.id === sectionId ? { ...item, content: merged } : item,
        ),
      };
    });
  }

  async function handleGalleryUpload(file: File, target: GalleryUploadTarget) {
    if (!invitation || !eventId || !gallerySection) return;

    const compressed = await compressGalleryImage(file);
    const fileError = validateGalleryFile(compressed);
    if (fileError) {
      setSaveError(fileError);
      setSaveStatus('error');
      return;
    }

    const sectionId = gallerySection.id;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setSaveError(null);
      setSaveStatus('idle');

      const asset = await uploadEventMediaWithProgress(
        eventId,
        compressed,
        (percent) => setUploadProgress(percent),
        invitation.id,
      );

      setInvitation((current) => {
        if (!current?.sections) return current;

        const section = current.sections.find((item) => item.id === sectionId);
        const parsed = parseGalleryDetails(section);
        let next = { ...parsed };

        if (target.type === 'background') {
          next.backgroundImageUrl = asset.fileUrl;
        } else if (target.type === 'album-cover') {
          next.albums = parsed.albums.map((album) =>
            album.id === target.albumId ? { ...album, coverImageUrl: asset.fileUrl } : album,
          );
        } else if (target.replaceId) {
          next.images = parsed.images.map((image) =>
            image.id === target.replaceId
              ? { ...image, url: asset.fileUrl, mediaId: asset.id }
              : image,
          );
        } else {
          next.images = [
            ...parsed.images,
            createGalleryImage(asset.fileUrl, target.albumId, asset.id),
          ];
        }

        const merged = galleryDetailsToContent(next);
        pendingSaveRef.current.sections.set(sectionId, merged);
        queueSave();

        return {
          ...current,
          sections: current.sections.map((item) =>
            item.id === sectionId ? { ...item, content: merged } : item,
          ),
        };
      });

      setSaveError(null);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to upload image.');
      setSaveStatus('error');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }

  function handleRsvpChange(sectionId: string, patch: RsvpEditorChange) {
    if (!patch.content && patch.rsvpDeadline === undefined) return;

    setInvitation((current) => {
      if (!current?.sections) return current;

      const section = current.sections.find((item) => item.id === sectionId);
      const parsed = parseRsvpDetails(section, current);
      const merged = patch.content
        ? rsvpDetailsToContent({ ...parsed, ...patch.content })
        : rsvpDetailsToContent(parsed);

      pendingSaveRef.current.sections.set(sectionId, merged);

      if (patch.rsvpDeadline !== undefined) {
        pendingSaveRef.current.invitation = {
          ...pendingSaveRef.current.invitation,
          rsvpDeadline: patch.rsvpDeadline,
        };
      }

      queueSave();

      return {
        ...current,
        rsvpDeadline: patch.rsvpDeadline !== undefined ? patch.rsvpDeadline : current.rsvpDeadline,
        sections: current.sections.map((item) =>
          item.id === sectionId ? { ...item, content: merged } : item,
        ),
      };
    });
  }

  async function handleRsvpUpload(file: File, target: RsvpUploadTarget) {
    if (!invitation || !eventId || !rsvpSection) return;

    const fileError = validateGalleryFile(file);
    if (fileError) {
      setSaveError(fileError);
      setSaveStatus('error');
      return;
    }

    const sectionId = rsvpSection.id;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setSaveError(null);

      const compressed = await compressGalleryImage(file);
      const asset = await uploadEventMediaWithProgress(
        eventId,
        compressed,
        (percent) => setUploadProgress(percent),
        invitation.id,
      );

      setInvitation((current) => {
        if (!current?.sections) return current;

        const section = current.sections.find((item) => item.id === sectionId);
        const parsed = parseRsvpDetails(section, current);
        const next =
          target.type === 'background'
            ? { ...parsed, backgroundImageUrl: asset.fileUrl }
            : parsed;

        const merged = rsvpDetailsToContent(next);
        pendingSaveRef.current.sections.set(sectionId, merged);
        queueSave();

        return {
          ...current,
          sections: current.sections.map((item) =>
            item.id === sectionId ? { ...item, content: merged } : item,
          ),
        };
      });
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to upload image.');
      setSaveStatus('error');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }

  async function handleScheduleUpload(file: File, target: ScheduleUploadTarget) {
    if (!invitation || !eventId || !scheduleSection) return;

    const sectionId = scheduleSection.id;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setSaveError(null);

      const asset = await uploadEventMediaWithProgress(
        eventId,
        file,
        (percent) => setUploadProgress(percent),
        invitation.id,
      );

      setInvitation((current) => {
        if (!current?.sections) return current;

        const section = current.sections.find((item) => item.id === sectionId);
        const parsed = parseScheduleDetails(section);
        let next = { ...parsed };

        if (target.type === 'section-background') {
          next.backgroundImageUrl = asset.fileUrl;
        } else if (target.type === 'dress-code-image') {
          next.dressCode = { ...parsed.dressCode, imageUrl: asset.fileUrl };
        } else if (target.type === 'event-background') {
          next.items = parsed.items.map((event) =>
            event.id === target.eventId ? { ...event, backgroundImageUrl: asset.fileUrl } : event,
          );
        }

        const merged = scheduleDetailsToContent(next);
        pendingSaveRef.current.sections.set(sectionId, merged);
        queueSave();

        return {
          ...current,
          sections: current.sections.map((item) =>
            item.id === sectionId ? { ...item, content: merged } : item,
          ),
        };
      });
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to upload image.');
      setSaveStatus('error');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }

  async function handleStoryUploadImage(file: File, target: StoryImageUploadTarget) {
    if (!invitation || !eventId || !storySection) return;

    const sectionId = storySection.id;

    try {
      setIsUploading(true);
      setSaveError(null);
      const asset = await uploadEventMedia(eventId, file, invitation.id);

      setInvitation((current) => {
        if (!current?.sections) return current;

        const section = current.sections.find((item) => item.id === sectionId);
        const parsed = parseStoryDetails(section);
        let next = { ...parsed };

        if (target.type === 'background') {
          next.backgroundImageUrl = asset.fileUrl;
        } else if (target.type === 'timeline') {
          next.timeline = parsed.timeline.map((event) =>
            event.id === target.eventId ? { ...event, imageUrl: asset.fileUrl } : event,
          );
        } else if (target.type === 'gallery') {
          if (target.replaceId) {
            next.gallery = parsed.gallery.map((image) =>
              image.id === target.replaceId ? { ...image, url: asset.fileUrl } : image,
            );
          } else {
            const newImage: StoryGalleryImage = {
              id: crypto.randomUUID(),
              url: asset.fileUrl,
              alt: '',
            };
            next.gallery = [...parsed.gallery, newImage];
          }
        }

        const merged = storyDetailsToContent(next);
        pendingSaveRef.current.sections.set(sectionId, merged);
        queueSave();

        return {
          ...current,
          sections: current.sections.map((item) =>
            item.id === sectionId ? { ...item, content: merged } : item,
          ),
        };
      });
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to upload image.');
      setSaveStatus('error');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleHeroUploadImage(file: File) {
    if (!invitation || !eventId || !heroSection) return;

    try {
      setIsUploading(true);
      setSaveError(null);
      const asset = await uploadEventMedia(eventId, file, invitation.id);
      const section = invitation.sections?.find((item) => item.id === heroSection.id);
      const current = parseHeroDetails(section, invitation);
      handleSectionChange(heroSection.id, heroDetailsToContent({ ...current, imageUrl: asset.fileUrl }));
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to upload image.');
      setSaveStatus('error');
    } finally {
      setIsUploading(false);
    }
  }

  function handleRemoveImage() {
    if (!heroSection || !invitation) return;
    const section = invitation.sections?.find((item) => item.id === heroSection.id);
    const current = parseHeroDetails(section, invitation);
    handleSectionChange(heroSection.id, heroDetailsToContent({ ...current, imageUrl: null }));
  }

  async function handlePublish() {
    if (!invitation || !eventId || !validation.isValid) return;

    try {
      setIsPublishing(true);
      setError(null);
      await flushSave();
      const updated = await publishInvitation(eventId, invitation.id);
      setInvitation((current) =>
        current ? { ...current, ...updated, sections: current.sections } : current,
      );
      setValidationSuccessMessage('Invitation published successfully.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to publish invitation.');
    } finally {
      setIsPublishing(false);
    }
  }

  function handlePublishClick() {
    if (!validation.isValid) return;
    void handlePublish();
  }

  const eventTitle = invitation?.event
    ? eventDisplayName({
        id: invitation.event.id,
        title: invitation.event.title,
        partnerOne: invitation.event.partnerOne,
        partnerTwo: invitation.event.partnerTwo,
        eventDate: invitation.event.eventDate,
        eventTimezone: 'UTC',
        venueName: invitation.event.venueName ?? null,
        venueAddress: invitation.event.venueAddress ?? null,
        coverImageUrl: invitation.event.coverImageUrl ?? null,
        ownerId: '',
        createdAt: '',
        updatedAt: '',
      })
    : invitation?.headline ?? 'Invitation';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f6] font-body text-sm text-[#6d625a]">
        Loading editor...
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#faf9f6] px-6">
        <p className="font-body text-sm text-red-700">{error ?? 'Invitation not found.'}</p>
        <Button asChild className="bg-[#4e342e] text-white hover:bg-[#3e2723]">
          <Link to="/dashboard/invitations">Back to Invitations</Link>
        </Button>
      </div>
    );
  }

  const publishDisabled =
    isPublishing || invitation.status === 'published' || !validation.isValid || saveStatus === 'saving';

  const issueCount = validationIssues.length;

  return (
    <div className="flex h-screen flex-col bg-[#faf9f6]">
      <PublishValidationDialog
        open={showValidationDialog}
        issues={validationIssues}
        onClose={() => setShowValidationDialog(false)}
        onSelectIssue={navigateToValidationIssue}
      />

      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#e8dfd6] bg-white px-4">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/invitations"
            className="flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.12em] text-[#6d625a] hover:text-[#4e342e]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="font-display text-lg text-[#4e342e]">{eventTitle}</span>
        </div>

        <div className="flex items-center gap-3">
          {!validation.isValid && (
            <button
              type="button"
              onClick={() => {
                setValidationAttempted(true);
                setShowValidationDialog(true);
              }}
              className="hidden rounded-full border border-red-200 bg-red-50 px-3 py-1.5 font-body text-xs font-medium text-red-700 transition-colors hover:bg-red-100 md:inline-flex"
            >
              {issueCount} required field{issueCount === 1 ? '' : 's'} missing
            </button>
          )}
          {validation.isValid && validationAttempted && (
            <p className="hidden font-body text-xs text-[#2e7d32] md:block">
              Ready to publish
            </p>
          )}
          <Button
            type="button"
            variant="ghost"
            className="h-9 gap-2 border border-[#e8dfd6] px-4 font-body text-sm text-[#4e342e]"
            onClick={() => window.open(`/api/v1/public/invitations/${invitation.slug}`, '_blank')}
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button
            type="button"
            disabled={publishDisabled}
            className="h-9 gap-2 bg-[#4e342e] px-4 font-body text-sm text-white hover:bg-[#3e2723] disabled:opacity-50"
            onClick={() => void handlePublishClick()}
          >
            <Send className="h-4 w-4" />
            {isPublishing
              ? 'Publishing...'
              : invitation.status === 'published'
                ? 'Published'
                : 'Publish'}
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <InvitationFlowSidebar
          eventTitle={eventTitle}
          sections={invitation.sections ?? []}
          activeSectionId={activeSectionId}
          autosaveLabel={autosaveLabel}
          sectionsWithErrors={sectionsWithErrors}
          onSelectSection={setActiveSectionId}
        />
        <InvitationPreview
          invitation={invitation}
          activeSection={activeSection}
          rsvpAnalytics={rsvpAnalytics}
        />
        <SectionEditorPanel
          invitation={invitation}
          section={activeSection}
          heroValidation={validation.hero}
          storyValidation={validation.story}
          scheduleValidation={validation.schedule}
          galleryValidation={validation.gallery}
          rsvpValidation={validation.rsvp}
          showValidation={validationAttempted}
          validationSuccessMessage={validationSuccessMessage}
          forcedOpenPanels={forcedOpenPanels}
          forceExpandScheduleEventId={forceExpandScheduleEventId}
          editorScrollRef={editorScrollRef}
          rsvpAnalytics={rsvpAnalytics}
          rsvpAnalyticsLoading={rsvpAnalyticsLoading}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          saveError={saveError}
          onInvitationChange={handleInvitationChange}
          onSectionChange={handleSectionChange}
          onHeroChange={handleHeroChange}
          onStoryChange={handleStoryChange}
          onScheduleChange={handleScheduleChange}
          onGalleryChange={handleGalleryChange}
          onRsvpChange={handleRsvpChange}
          onHeroUploadImage={(file) => void handleHeroUploadImage(file)}
          onHeroRemoveImage={handleRemoveImage}
          onStoryUploadImage={(file, target) => void handleStoryUploadImage(file, target)}
          onScheduleUpload={(file, target) => void handleScheduleUpload(file, target)}
          saveStatus={saveStatus}
          onGalleryUpload={(file, target) => void handleGalleryUpload(file, target)}
          onRsvpUpload={(file, target) => void handleRsvpUpload(file, target)}
        />
      </div>
    </div>
  );
}
