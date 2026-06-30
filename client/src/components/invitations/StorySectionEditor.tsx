import { useRef, useState, type ReactNode } from 'react';
import { GripVertical, ImagePlus, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/invitations/RichTextEditor';
import type { InvitationSection } from '@/types/api';
import {
  STORY_FONT_OPTIONS,
  STORY_LAYOUT_OPTIONS,
  createTimelineEvent,
  parseStoryDetails,
  type StoryDetailsContent,
  type StoryGalleryImage,
  type StoryTimelineEvent,
  type StoryValidationResult,
} from '@/lib/storySection';
import { cn } from '@/lib/utils';
import { EditorField } from '@/components/invitations/PublishValidationDialog';

export interface StoryEditorChange {
  content?: Partial<StoryDetailsContent>;
}

interface StorySectionEditorProps {
  section: InvitationSection;
  validation: StoryValidationResult;
  showValidation?: boolean;
  isUploading: boolean;
  onChange: (patch: StoryEditorChange) => void;
  onUploadImage: (file: File, target: StoryImageUploadTarget) => void | Promise<void>;
}

export type StoryImageUploadTarget =
  | { type: 'background' }
  | { type: 'timeline'; eventId: string }
  | { type: 'gallery'; replaceId?: string };

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9e8e82]">
      {children}
    </p>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="font-body text-xs text-[#6d625a]">{label}</label>
      <div className="mt-1.5">{children}</div>
      {hint && !error && <p className="mt-1 font-body text-xs text-[#9e8e82]">{hint}</p>}
      {error && <p className="mt-1 font-body text-xs text-red-600">{error}</p>}
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-body text-sm text-[#4e342e]">{label}</span>
        <span className="font-body text-xs text-[#9e8e82]">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[#c5a67c]"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-lg border border-[#e8dfd6] bg-white px-3 font-body text-sm text-[#4e342e] outline-none focus:border-[#c5a67c]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function reorderItems<T extends { id: string }>(items: T[], fromId: string, toId: string) {
  const fromIndex = items.findIndex((item) => item.id === fromId);
  const toIndex = items.findIndex((item) => item.id === toId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return items;

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function DraggableListItem({
  id,
  onDragStart,
  onDragOver,
  onDrop,
  children,
}: {
  id: string;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (id: string) => void;
  children: ReactNode;
}) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(id)}
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
        onDragOver(id);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={() => {
        setIsOver(false);
        onDrop(id);
      }}
      className={cn(
        'rounded-xl border bg-[#faf9f6] transition-colors',
        isOver ? 'border-[#c5a67c] bg-[#faf7f2]' : 'border-[#e8dfd6]',
      )}
    >
      <div className="flex items-start gap-2 p-3">
        <button
          type="button"
          className="mt-1 cursor-grab rounded p-1 text-[#9e8e82] hover:bg-white active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

export function StorySectionEditor({
  section,
  validation,
  showValidation = false,
  isUploading,
  onChange,
  onUploadImage,
}: StorySectionEditorProps) {
  const story = parseStoryDetails(section);
  const dragIdRef = useRef<string | null>(null);
  const timelineFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);
  const backgroundFileRef = useRef<HTMLInputElement>(null);
  const [timelineUploadId, setTimelineUploadId] = useState<string | null>(null);
  const [galleryReplaceId, setGalleryReplaceId] = useState<string | null>(null);

  function updateContent(patch: Partial<StoryDetailsContent>) {
    onChange({ content: patch });
  }

  function updateTimeline(events: StoryTimelineEvent[]) {
    updateContent({ timeline: events });
  }

  function updateGallery(gallery: StoryGalleryImage[]) {
    updateContent({ gallery });
  }

  function handleTimelineDrop(targetId: string) {
    const dragId = dragIdRef.current;
    if (!dragId) return;
    updateTimeline(reorderItems(story.timeline, dragId, targetId));
    dragIdRef.current = null;
  }

  function handleGalleryDrop(targetId: string) {
    const dragId = dragIdRef.current;
    if (!dragId) return;
    updateGallery(reorderItems(story.gallery, dragId, targetId));
    dragIdRef.current = null;
  }

  return (
    <div className="space-y-8">
      <div data-validation-panel="story-content">
        <SectionLabel>Story Content</SectionLabel>
        <div className="mt-3 space-y-4">
          <EditorField
            label="Story Title"
            fieldId="story:title"
            showValidation={showValidation}
            error={validation.errors.title}
          >
            <Input
              value={story.title}
              onChange={(e) => updateContent({ title: e.target.value })}
              placeholder="Our Story"
            />
          </EditorField>
          <Field label="Story Subtitle (optional)">
            <Input
              value={story.subtitle}
              onChange={(e) => updateContent({ subtitle: e.target.value })}
              placeholder="How we met"
            />
          </Field>
          <Field label="Couple's Story">
            <RichTextEditor
              value={story.body}
              onChange={(html) => updateContent({ body: html })}
            />
          </Field>
        </div>
      </div>

      <div data-validation-panel="story-timeline">
        <div className="flex items-center justify-between">
          <SectionLabel>Timeline</SectionLabel>
          <button
            type="button"
            onClick={() => updateTimeline([...story.timeline, createTimelineEvent()])}
            className="inline-flex items-center gap-1 font-body text-xs font-semibold text-[#c5a67c] hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Add event
          </button>
        </div>

        {validation.warnings.noTimeline && story.timeline.length === 0 && (
          <p className="mt-2 rounded-lg bg-[#faf7f2] px-3 py-2 font-body text-xs text-[#9e8e82]">
            {validation.warnings.noTimeline}
          </p>
        )}

        <div className="mt-3 space-y-3">
          {story.timeline.map((event) => {
            const eventError = validation.errors.timelineEvents?.[event.id]?.title;
            return (
              <DraggableListItem
                key={event.id}
                id={event.id}
                onDragStart={(id) => {
                  dragIdRef.current = id;
                }}
                onDragOver={() => {}}
                onDrop={handleTimelineDrop}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <EditorField
                      label="Event Title"
                      fieldId={`story:timeline:${event.id}:title`}
                      showValidation={showValidation}
                      error={eventError}
                    >
                      <Input
                        value={event.title}
                        onChange={(e) =>
                          updateTimeline(
                            story.timeline.map((item) =>
                              item.id === event.id ? { ...item, title: e.target.value } : item,
                            ),
                          )
                        }
                        placeholder="First date"
                      />
                    </EditorField>
                    <button
                      type="button"
                      onClick={() =>
                        updateTimeline(story.timeline.filter((item) => item.id !== event.id))
                      }
                      className="mt-6 rounded p-1.5 text-[#c45c5c] hover:bg-white"
                      aria-label="Delete event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Date">
                      <Input
                        type="date"
                        value={event.date}
                        onChange={(e) =>
                          updateTimeline(
                            story.timeline.map((item) =>
                              item.id === event.id ? { ...item, date: e.target.value } : item,
                            ),
                          )
                        }
                      />
                    </Field>
                    <Field label="Location (optional)">
                      <Input
                        value={event.location}
                        onChange={(e) =>
                          updateTimeline(
                            story.timeline.map((item) =>
                              item.id === event.id ? { ...item, location: e.target.value } : item,
                            ),
                          )
                        }
                        placeholder="Paris, France"
                      />
                    </Field>
                  </div>

                  <Field label="Description">
                    <textarea
                      value={event.description}
                      onChange={(e) =>
                        updateTimeline(
                          story.timeline.map((item) =>
                            item.id === event.id ? { ...item, description: e.target.value } : item,
                          ),
                        )
                      }
                      rows={3}
                      className="w-full rounded-lg border border-[#e8dfd6] px-3 py-2 font-body text-sm text-[#4e342e] outline-none focus:border-[#c5a67c]"
                      placeholder="Tell this chapter of your story..."
                    />
                  </Field>

                  <div className="overflow-hidden rounded-lg border border-[#e8dfd6] bg-white">
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt="" className="aspect-video w-full object-cover" />
                    ) : (
                      <div className="flex aspect-video items-center justify-center font-body text-xs text-[#9e8e82]">
                        No image
                      </div>
                    )}
                    <div className="flex gap-3 border-t border-[#e8dfd6] px-3 py-2">
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => {
                          setTimelineUploadId(event.id);
                          timelineFileRef.current?.click();
                        }}
                        className="inline-flex items-center gap-1 font-body text-xs text-[#c5a67c] hover:underline disabled:opacity-50"
                      >
                        <ImagePlus className="h-3.5 w-3.5" />
                        {isUploading && timelineUploadId === event.id ? 'Uploading...' : 'Upload'}
                      </button>
                      {event.imageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            updateTimeline(
                              story.timeline.map((item) =>
                                item.id === event.id ? { ...item, imageUrl: null } : item,
                              ),
                            )
                          }
                          className="font-body text-xs text-[#c45c5c] hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </DraggableListItem>
            );
          })}
        </div>

        <input
          ref={timelineFileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && timelineUploadId) {
              onUploadImage(file, { type: 'timeline', eventId: timelineUploadId });
            }
            e.target.value = '';
            setTimelineUploadId(null);
          }}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <SectionLabel>Gallery</SectionLabel>
          <button
            type="button"
            disabled={isUploading}
            onClick={() => galleryFileRef.current?.click()}
            className="inline-flex items-center gap-1 font-body text-xs font-semibold text-[#c5a67c] hover:underline disabled:opacity-50"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            {isUploading ? 'Uploading...' : 'Upload photos'}
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {story.gallery.map((image) => (
            <DraggableListItem
              key={image.id}
              id={image.id}
              onDragStart={(id) => {
                dragIdRef.current = id;
              }}
              onDragOver={() => {}}
              onDrop={handleGalleryDrop}
            >
              <img src={image.url} alt={image.alt} className="aspect-square w-full rounded-lg object-cover" />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => {
                    setGalleryReplaceId(image.id);
                    galleryFileRef.current?.click();
                  }}
                  className="font-body text-xs text-[#c5a67c] hover:underline disabled:opacity-50"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => updateGallery(story.gallery.filter((item) => item.id !== image.id))}
                  className="font-body text-xs text-[#c45c5c] hover:underline"
                >
                  Delete
                </button>
              </div>
            </DraggableListItem>
          ))}
        </div>

        <input
          ref={galleryFileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            for (const file of files) {
              await onUploadImage(file, {
                type: 'gallery',
                ...(galleryReplaceId ? { replaceId: galleryReplaceId } : {}),
              });
            }
            e.target.value = '';
            setGalleryReplaceId(null);
          }}
        />
      </div>

      <div>
        <SectionLabel>Layout</SectionLabel>
        <div className="mt-3">
          <SelectField
            label="Story Layout"
            value={story.layout}
            onChange={(value) =>
              updateContent({ layout: value as StoryDetailsContent['layout'] })
            }
            options={STORY_LAYOUT_OPTIONS}
          />
        </div>
      </div>

      <div>
        <SectionLabel>Design</SectionLabel>
        <div className="mt-3 space-y-4">
          <Field label="Background Color">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={story.backgroundColor}
                onChange={(e) => updateContent({ backgroundColor: e.target.value })}
                className="h-10 w-12 cursor-pointer rounded border border-[#e8dfd6] bg-white"
              />
              <Input
                value={story.backgroundColor}
                onChange={(e) => updateContent({ backgroundColor: e.target.value })}
              />
            </div>
          </Field>

          <div className="overflow-hidden rounded-xl border border-[#e8dfd6]">
            {story.backgroundImageUrl ? (
              <img
                src={story.backgroundImageUrl}
                alt=""
                className="aspect-video w-full object-cover"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-[#faf7f2] font-body text-sm text-[#9e8e82]">
                No background image
              </div>
            )}
            <div className="flex gap-4 border-t border-[#e8dfd6] px-3 py-2">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => backgroundFileRef.current?.click()}
                className="inline-flex items-center gap-1.5 font-body text-sm text-[#c5a67c] hover:underline disabled:opacity-50"
              >
                <ImagePlus className="h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
              {story.backgroundImageUrl && (
                <button
                  type="button"
                  onClick={() => updateContent({ backgroundImageUrl: null })}
                  className="font-body text-sm text-[#c45c5c] hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={backgroundFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadImage(file, { type: 'background' });
                e.target.value = '';
              }}
            />
          </div>

          <SliderField
            label="Overlay Opacity"
            value={Math.round(story.overlayOpacity * 100)}
            min={0}
            max={100}
            suffix="%"
            onChange={(value) => updateContent({ overlayOpacity: value / 100 })}
          />
          <SliderField
            label="Section Padding"
            value={story.sectionPadding}
            min={16}
            max={64}
            suffix="px"
            onChange={(value) => updateContent({ sectionPadding: value })}
          />
          <SliderField
            label="Border Radius"
            value={story.borderRadius}
            min={0}
            max={32}
            suffix="px"
            onChange={(value) => updateContent({ borderRadius: value })}
          />
          <SelectField
            label="Font Family"
            value={story.fontFamily}
            onChange={(value) => updateContent({ fontFamily: value })}
            options={STORY_FONT_OPTIONS}
          />
          <SliderField
            label="Title Font Size"
            value={story.titleFontSize}
            min={18}
            max={36}
            suffix="px"
            onChange={(value) => updateContent({ titleFontSize: value })}
          />
          <SliderField
            label="Body Font Size"
            value={story.bodyFontSize}
            min={10}
            max={18}
            suffix="px"
            onChange={(value) => updateContent({ bodyFontSize: value })}
          />
          <Field label="Text Color">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={story.textColor}
                onChange={(e) => updateContent({ textColor: e.target.value })}
                className="h-10 w-12 cursor-pointer rounded border border-[#e8dfd6] bg-white"
              />
              <Input
                value={story.textColor}
                onChange={(e) => updateContent({ textColor: e.target.value })}
              />
            </div>
          </Field>
          <SelectField
            label="Text Alignment"
            value={story.textAlign}
            onChange={(value) =>
              updateContent({ textAlign: value as StoryDetailsContent['textAlign'] })
            }
            options={[
              { label: 'Left', value: 'left' },
              { label: 'Center', value: 'center' },
              { label: 'Right', value: 'right' },
            ]}
          />
        </div>
      </div>

      <div>
        <SectionLabel>Animation</SectionLabel>
        <div className="mt-3">
          <SelectField
            label="Entrance Animation"
            value={story.animation}
            onChange={(value) =>
              updateContent({ animation: value as StoryDetailsContent['animation'] })
            }
            options={[
              { label: 'None', value: 'none' },
              { label: 'Fade In', value: 'fade-in' },
              { label: 'Slide Up', value: 'slide-up' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
