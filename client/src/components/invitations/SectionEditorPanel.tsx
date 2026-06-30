import { type RefObject } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import type { Invitation, InvitationSection, RsvpAnalytics } from '@/types/api';
import { HeroSectionEditor, type HeroEditorChange } from '@/components/invitations/HeroSectionEditor';
import {
  GallerySectionEditor,
  type GalleryEditorChange,
  type GalleryUploadTarget,
} from '@/components/invitations/GallerySectionEditor';
import {
  RsvpSectionEditor,
  type RsvpEditorChange,
  type RsvpUploadTarget,
} from '@/components/invitations/RsvpSectionEditor';
import {
  ScheduleSectionEditor,
  type ScheduleEditorChange,
  type ScheduleUploadTarget,
} from '@/components/invitations/ScheduleSectionEditor';
import {
  StorySectionEditor,
  type StoryEditorChange,
  type StoryImageUploadTarget,
} from '@/components/invitations/StorySectionEditor';
import { EditorValidationBanner } from '@/components/invitations/PublishValidationDialog';
import { SECTION_FLOW_LABELS } from '@/lib/invitations';
import type { GalleryValidationResult } from '@/lib/gallerySection';
import type { HeroValidationResult } from '@/lib/heroSection';
import type { RsvpValidationResult } from '@/lib/rsvpSection';
import type { ScheduleValidationResult } from '@/lib/scheduleSection';
import type { StoryValidationResult } from '@/lib/storySection';

interface SectionEditorPanelProps {
  invitation: Invitation;
  section: InvitationSection | null;
  heroValidation: HeroValidationResult;
  storyValidation: StoryValidationResult;
  scheduleValidation: ScheduleValidationResult;
  galleryValidation: GalleryValidationResult;
  rsvpValidation: RsvpValidationResult;
  showValidation: boolean;
  validationSuccessMessage: string | null;
  forcedOpenPanels: Set<string>;
  forceExpandScheduleEventId: string | null;
  editorScrollRef: RefObject<HTMLDivElement | null>;
  rsvpAnalytics: RsvpAnalytics | null;
  rsvpAnalyticsLoading: boolean;
  isUploading: boolean;
  uploadProgress: number | null;
  saveError: string | null;
  onInvitationChange: (updates: Partial<Invitation>) => void;
  onSectionChange: (sectionId: string, content: Record<string, unknown>) => void;
  onHeroChange: (sectionId: string, patch: HeroEditorChange) => void;
  onStoryChange: (sectionId: string, patch: StoryEditorChange) => void;
  onScheduleChange: (sectionId: string, patch: ScheduleEditorChange) => void;
  onGalleryChange: (sectionId: string, patch: GalleryEditorChange) => void;
  onRsvpChange: (sectionId: string, patch: RsvpEditorChange) => void;
  onHeroUploadImage: (file: File) => void;
  onHeroRemoveImage: () => void;
  onStoryUploadImage: (file: File, target: StoryImageUploadTarget) => void | Promise<void>;
  onScheduleUpload: (file: File, target: ScheduleUploadTarget) => void | Promise<void>;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  onGalleryUpload: (file: File, target: GalleryUploadTarget) => void | Promise<void>;
  onRsvpUpload: (file: File, target: RsvpUploadTarget) => void | Promise<void>;
}

export function SectionEditorPanel({
  invitation,
  section,
  heroValidation,
  storyValidation,
  scheduleValidation,
  galleryValidation,
  rsvpValidation,
  showValidation,
  validationSuccessMessage,
  forcedOpenPanels,
  forceExpandScheduleEventId,
  editorScrollRef,
  rsvpAnalytics,
  rsvpAnalyticsLoading,
  isUploading,
  uploadProgress,
  saveError,
  onInvitationChange,
  onHeroChange,
  onStoryChange,
  onScheduleChange,
  onGalleryChange,
  onRsvpChange,
  onHeroUploadImage,
  onHeroRemoveImage,
  onStoryUploadImage,
  onScheduleUpload,
  saveStatus,
  onGalleryUpload,
  onRsvpUpload,
}: SectionEditorPanelProps) {
  if (!section) {
    return (
      <aside className="w-[380px] shrink-0 border-l border-[#e8dfd6] bg-white p-6">
        <p className="font-body text-sm text-[#6d625a]">Select a page from the invitation flow.</p>
      </aside>
    );
  }

  const sectionLabel = SECTION_FLOW_LABELS[section.sectionType];
  const isHero = section.sectionType === 'hero';
  const isStory = section.sectionType === 'story';
  const isSchedule = section.sectionType === 'schedule';
  const isGallery = section.sectionType === 'gallery';
  const isRsvp = section.sectionType === 'rsvp';
  const isWidePanel = isHero || isStory || isSchedule || isGallery || isRsvp;

  return (
    <aside
      className={`flex shrink-0 flex-col border-l border-[#e8dfd6] bg-white ${isWidePanel ? 'w-[380px]' : 'w-[320px]'}`}
    >
      <div className="flex items-center justify-between border-b border-[#e8dfd6] px-5 py-4">
        <h2 className="font-body text-sm font-semibold text-[#4e342e]">{sectionLabel} Section</h2>
        <div className="flex items-center gap-1 text-[#9e8e82]">
          <button type="button" className="rounded p-1 hover:bg-[#faf7f2]" aria-label="Move section up">
            <ChevronUp className="h-4 w-4" />
          </button>
          <button type="button" className="rounded p-1 hover:bg-[#faf7f2]" aria-label="Move section down">
            <ChevronDown className="h-4 w-4" />
          </button>
          <button type="button" className="rounded p-1 hover:bg-[#faf7f2]" aria-label="Delete section" disabled>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {saveError && (
        <p className="mx-5 mt-4 rounded-lg bg-red-50 px-3 py-2 font-body text-xs text-red-700" role="alert">
          {saveError}
        </p>
      )}

      {validationSuccessMessage && (
        <div className="mx-5 mt-4">
          <EditorValidationBanner message={validationSuccessMessage} variant="success" />
        </div>
      )}

      <div ref={editorScrollRef} className="flex-1 overflow-y-auto px-5 py-5">
        {isHero ? (
          <HeroSectionEditor
            invitation={invitation}
            section={section}
            validation={heroValidation}
            showValidation={showValidation}
            isUploading={isUploading}
            onChange={(patch) => onHeroChange(section.id, patch)}
            onUploadImage={onHeroUploadImage}
            onRemoveImage={onHeroRemoveImage}
          />
        ) : isStory ? (
          <StorySectionEditor
            section={section}
            validation={storyValidation}
            showValidation={showValidation}
            isUploading={isUploading}
            onChange={(patch) => onStoryChange(section.id, patch)}
            onUploadImage={onStoryUploadImage}
          />
        ) : isSchedule ? (
          <ScheduleSectionEditor
            section={section}
            validation={scheduleValidation}
            showValidation={showValidation}
            forcedOpenPanels={forcedOpenPanels}
            forceExpandEventId={forceExpandScheduleEventId}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            saveStatus={saveStatus}
            saveError={saveError}
            onChange={(patch) => onScheduleChange(section.id, patch)}
            onUpload={onScheduleUpload}
          />
        ) : isGallery ? (
          <GallerySectionEditor
            section={section}
            validation={galleryValidation}
            showValidation={showValidation}
            forcedOpenPanels={forcedOpenPanels}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            saveStatus={saveStatus}
            saveError={saveError}
            onChange={(patch) => onGalleryChange(section.id, patch)}
            onUpload={onGalleryUpload}
          />
        ) : isRsvp ? (
          <RsvpSectionEditor
            section={section}
            invitation={invitation}
            validation={rsvpValidation}
            showValidation={showValidation}
            forcedOpenPanels={forcedOpenPanels}
            analytics={rsvpAnalytics}
            analyticsLoading={rsvpAnalyticsLoading}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            saveStatus={saveStatus}
            saveError={saveError}
            onChange={(patch) => onRsvpChange(section.id, patch)}
            onUpload={onRsvpUpload}
          />
        ) : (
          <div className="space-y-4">
            <p className="font-body text-sm text-[#6d625a]">
              Edit content for your {sectionLabel.toLowerCase()} section.
            </p>
            <div>
              <label className="font-body text-xs text-[#6d625a]">Section body</label>
              <textarea
                value={invitation.bodyContent ?? ''}
                onChange={(e) => onInvitationChange({ bodyContent: e.target.value })}
                rows={6}
                className="mt-1.5 w-full rounded-lg border border-[#e8dfd6] px-3 py-2 font-body text-sm text-[#4e342e] outline-none focus:border-[#c5a67c]"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
