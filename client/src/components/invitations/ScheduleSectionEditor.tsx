import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  GripVertical,
  ImagePlus,
  MapPin,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { InvitationSection } from '@/types/api';
import {
  DRESS_CODE_OPTIONS,
  SCHEDULE_CARD_STYLE_OPTIONS,
  SCHEDULE_EVENT_TYPE_OPTIONS,
  SCHEDULE_FONT_OPTIONS,
  SCHEDULE_ICON_OPTIONS,
  SCHEDULE_ICON_STYLE_OPTIONS,
  SCHEDULE_LAYOUT_OPTIONS,
  SCHEDULE_STATUS_OPTIONS,
  createScheduleEvent,
  duplicateScheduleEvent,
  isValidMapsUrl,
  parseScheduleDetails,
  type ScheduleDetailsContent,
  type ScheduleEvent,
  type ScheduleValidationResult,
} from '@/lib/scheduleSection';
import { cn } from '@/lib/utils';
import { EditorField } from '@/components/invitations/PublishValidationDialog';

export interface ScheduleEditorChange {
  content?: Partial<ScheduleDetailsContent>;
}

export type ScheduleUploadTarget =
  | { type: 'section-background' }
  | { type: 'dress-code-image' }
  | { type: 'event-background'; eventId: string };

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface ScheduleSectionEditorProps {
  section: InvitationSection;
  validation: ScheduleValidationResult;
  showValidation?: boolean;
  forcedOpenPanels?: Set<string>;
  forceExpandEventId?: string | null;
  isUploading: boolean;
  uploadProgress: number | null;
  saveStatus: SaveStatus;
  saveError: string | null;
  onChange: (patch: ScheduleEditorChange) => void;
  onUpload: (file: File, target: ScheduleUploadTarget) => void | Promise<void>;
}

function Collapsible({
  title,
  panelKey,
  forcedOpenPanels,
  defaultOpen = true,
  children,
}: {
  title: string;
  panelKey?: string;
  forcedOpenPanels?: Set<string>;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const forcedOpen = panelKey ? forcedOpenPanels?.has(panelKey) : false;
  const isOpen = forcedOpen || open;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8dfd6] bg-[#faf9f6]" data-validation-panel={panelKey}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-[#6d625a]">
          {title}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-[#9e8e82] transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && <div className="space-y-4 border-t border-[#e8dfd6] px-4 py-4">{children}</div>}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="font-body text-xs text-[#6d625a]">{label}</label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 font-body text-xs text-red-600">{error}</p>}
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  suffix = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
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

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 py-2">
      <span className="font-body text-sm text-[#4e342e]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          checked ? 'bg-[#c5a67c]' : 'bg-[#e8dfd6]',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          )}
        />
      </button>
    </label>
  );
}

function EditorToast({ saveStatus, saveError }: { saveStatus: SaveStatus; saveError: string | null }) {
  if (saveStatus === 'idle') return null;

  const isError = saveStatus === 'error';
  const isSaving = saveStatus === 'saving';

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-xl px-3 py-2 font-body text-xs',
        isError ? 'bg-red-50 text-red-700' : isSaving ? 'bg-[#faf7f2] text-[#6d625a]' : 'bg-[#e8f5e9] text-[#2e7d32]',
      )}
      role="status"
    >
      {isError ? <XCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
      {isError ? saveError ?? 'Save failed' : isSaving ? 'Saving...' : 'Saved just now'}
    </div>
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

export function ScheduleSectionEditor({
  section,
  validation,
  showValidation = false,
  forcedOpenPanels,
  forceExpandEventId,
  isUploading,
  uploadProgress,
  saveStatus,
  saveError,
  onChange,
  onUpload,
}: ScheduleSectionEditorProps) {
  const schedule = parseScheduleDetails(section);
  const dragIdRef = useRef<string | null>(null);
  const sectionBgRef = useRef<HTMLInputElement>(null);
  const dressCodeRef = useRef<HTMLInputElement>(null);
  const eventBgRef = useRef<HTMLInputElement>(null);
  const [eventBgTargetId, setEventBgTargetId] = useState<string | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(schedule.items[0]?.id ?? null);

  useEffect(() => {
    if (forceExpandEventId) {
      setExpandedEventId(forceExpandEventId);
    }
  }, [forceExpandEventId]);

  useEffect(() => {
    if (!expandedEventId && schedule.items[0]) {
      setExpandedEventId(schedule.items[0].id);
    }
  }, [schedule.items, expandedEventId]);

  function updateContent(patch: Partial<ScheduleDetailsContent>) {
    onChange({ content: patch });
  }

  function updateItems(items: ScheduleEvent[]) {
    updateContent({ items });
  }

  function updateEvent(eventId: string, patch: Partial<ScheduleEvent>) {
    updateItems(schedule.items.map((item) => (item.id === eventId ? { ...item, ...patch } : item)));
  }

  function handleDrop(targetId: string) {
    const dragId = dragIdRef.current;
    if (!dragId) return;
    updateItems(reorderItems(schedule.items, dragId, targetId));
    dragIdRef.current = null;
  }

  return (
    <div className="space-y-5">
      <EditorToast saveStatus={saveStatus} saveError={saveError} />

      {isUploading && uploadProgress !== null && (
        <div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#e8dfd6]">
            <div className="h-full bg-[#c5a67c] transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
          <p className="mt-1 font-body text-xs text-[#9e8e82]">Uploading… {uploadProgress}%</p>
        </div>
      )}

      <Collapsible title="Section Content">
        <Field label="Section Title">
          <Input
            value={schedule.sectionTitle}
            onChange={(e) => updateContent({ sectionTitle: e.target.value })}
            placeholder="Weekend Schedule"
          />
        </Field>
        <Field label="Subtitle">
          <Input
            value={schedule.subtitle}
            onChange={(e) => updateContent({ subtitle: e.target.value })}
            placeholder="Celebration of love"
          />
        </Field>
        <Field label="Description">
          <textarea
            value={schedule.description}
            onChange={(e) => updateContent({ description: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-[#e8dfd6] px-3 py-2 font-body text-sm text-[#4e342e] outline-none focus:border-[#c5a67c]"
          />
        </Field>
        <Field label="Intro Message">
          <textarea
            value={schedule.introMessage}
            onChange={(e) => updateContent({ introMessage: e.target.value })}
            rows={2}
            placeholder="We can't wait to celebrate with you."
            className="w-full rounded-lg border border-[#e8dfd6] px-3 py-2 font-body text-sm text-[#4e342e] outline-none focus:border-[#c5a67c]"
          />
        </Field>
        <div className="overflow-hidden rounded-xl border border-[#e8dfd6] bg-white">
          {schedule.backgroundImageUrl ? (
            <img src={schedule.backgroundImageUrl} alt="" className="aspect-video w-full object-cover" />
          ) : (
            <div className="flex aspect-video items-center justify-center font-body text-sm text-[#9e8e82]">
              Section background
            </div>
          )}
          <div className="flex gap-3 border-t border-[#e8dfd6] px-3 py-2">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => sectionBgRef.current?.click()}
              className="font-body text-sm text-[#c5a67c] hover:underline disabled:opacity-50"
            >
              Upload background
            </button>
            {schedule.backgroundImageUrl && (
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
            ref={sectionBgRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onUpload(file, { type: 'section-background' });
              e.target.value = '';
            }}
          />
        </div>
      </Collapsible>

      <Collapsible title="Event Timeline" panelKey="schedule-events" forcedOpenPanels={forcedOpenPanels}>
        <div className="flex items-center justify-between">
          <p className="font-body text-xs text-[#9e8e82]">{schedule.items.length} events</p>
          <button
            type="button"
            onClick={() => {
              const event = createScheduleEvent();
              updateItems([...schedule.items, event]);
              setExpandedEventId(event.id);
            }}
            className="inline-flex items-center gap-1 font-body text-xs font-semibold text-[#c5a67c] hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Add event
          </button>
        </div>

        {schedule.items.length === 0 && (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-[#e8dfd6] bg-white px-4 py-8 text-center">
            <CalendarDays className="h-8 w-8 text-[#c5a67c]" />
            <p className="mt-3 font-body text-sm text-[#6d625a]">No events yet</p>
            <p className="mt-1 font-body text-xs text-[#9e8e82]">Add your ceremony, reception, and more.</p>
          </div>
        )}

        <div className="space-y-3">
          {schedule.items.map((event) => {
            const eventErrors = validation.errors.events?.[event.id];
            const isExpanded = expandedEventId === event.id;
            return (
              <div
                key={event.id}
                draggable
                onDragStart={() => {
                  dragIdRef.current = event.id;
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(event.id)}
                className={cn(
                  'rounded-xl border bg-white',
                  showValidation && eventErrors && Object.keys(eventErrors).length > 0
                    ? 'border-red-300'
                    : 'border-[#e8dfd6]',
                )}
              >
                <div className="flex items-center gap-2 px-3 py-2">
                  <GripVertical className="h-4 w-4 cursor-grab text-[#9e8e82]" />
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left font-body text-sm font-medium text-[#4e342e]"
                    onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                  >
                    {event.title || 'Untitled event'}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateItems([...schedule.items, duplicateScheduleEvent(event)])}
                    className="rounded p-1 text-[#9e8e82] hover:bg-[#faf7f2]"
                    aria-label="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateItems(schedule.items.filter((item) => item.id !== event.id))}
                    className="rounded p-1 text-[#c45c5c] hover:bg-[#faf7f2]"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="space-y-3 border-t border-[#e8dfd6] px-3 py-3">
                    <EditorField
                      label="Event Title"
                      fieldId={`schedule:${event.id}:title`}
                      showValidation={showValidation}
                      error={eventErrors?.title}
                    >
                      <Input
                        value={event.title}
                        onChange={(e) => updateEvent(event.id, { title: e.target.value })}
                        placeholder="Ceremony"
                      />
                    </EditorField>
                    <div className="grid grid-cols-2 gap-3">
                      <SelectField
                        label="Event Type"
                        value={event.eventType}
                        onChange={(value) =>
                          updateEvent(event.id, { eventType: value as ScheduleEvent['eventType'] })
                        }
                        options={SCHEDULE_EVENT_TYPE_OPTIONS}
                      />
                      <SelectField
                        label="Icon"
                        value={event.icon}
                        onChange={(value) => updateEvent(event.id, { icon: value })}
                        options={SCHEDULE_ICON_OPTIONS}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <EditorField
                        label="Date"
                        fieldId={`schedule:${event.id}:date`}
                        showValidation={showValidation}
                        error={eventErrors?.date}
                      >
                        <Input type="date" value={event.date} onChange={(e) => updateEvent(event.id, { date: e.target.value })} />
                      </EditorField>
                      <EditorField
                        label="Start Time"
                        fieldId={`schedule:${event.id}:startTime`}
                        showValidation={showValidation}
                        error={eventErrors?.startTime}
                      >
                        <Input value={event.startTime} onChange={(e) => updateEvent(event.id, { startTime: e.target.value })} placeholder="3:00 PM" />
                      </EditorField>
                      <Field label="End Time">
                        <Input value={event.endTime} onChange={(e) => updateEvent(event.id, { endTime: e.target.value })} placeholder="4:30 PM" />
                      </Field>
                    </div>
                    <EditorField
                      label="Venue Name"
                      fieldId={`schedule:${event.id}:venueName`}
                      showValidation={showValidation}
                      error={eventErrors?.venueName}
                    >
                      <Input value={event.venueName} onChange={(e) => updateEvent(event.id, { venueName: e.target.value })} />
                    </EditorField>
                    <Field label="Venue Address">
                      <Input value={event.venueAddress} onChange={(e) => updateEvent(event.id, { venueAddress: e.target.value })} />
                    </Field>
                    <Field label="Google Maps URL">
                      <Input value={event.mapsUrl} onChange={(e) => updateEvent(event.id, { mapsUrl: e.target.value })} placeholder="https://maps.google.com/..." />
                    </Field>
                    {isValidMapsUrl(event.mapsUrl) && (
                      <a href={event.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-body text-xs text-[#c5a67c] hover:underline">
                        Preview map <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <Field label="Description">
                      <textarea
                        value={event.description}
                        onChange={(e) => updateEvent(event.id, { description: e.target.value })}
                        rows={2}
                        className="w-full rounded-lg border border-[#e8dfd6] px-3 py-2 font-body text-sm outline-none focus:border-[#c5a67c]"
                      />
                    </Field>
                    <div className="overflow-hidden rounded-lg border border-[#e8dfd6]">
                      {event.backgroundImageUrl ? (
                        <img src={event.backgroundImageUrl} alt="" className="aspect-video w-full object-cover" />
                      ) : (
                        <div className="flex aspect-video items-center justify-center font-body text-xs text-[#9e8e82]">Event background</div>
                      )}
                      <div className="flex gap-3 border-t border-[#e8dfd6] px-3 py-2">
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => {
                            setEventBgTargetId(event.id);
                            eventBgRef.current?.click();
                          }}
                          className="font-body text-xs text-[#c5a67c] hover:underline disabled:opacity-50"
                        >
                          Upload image
                        </button>
                        {event.backgroundImageUrl && (
                          <button type="button" onClick={() => updateEvent(event.id, { backgroundImageUrl: null })} className="font-body text-xs text-[#c45c5c] hover:underline">
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="rounded-xl border border-[#e8dfd6] px-3 py-1">
                      <ToggleRow label="Main Event" checked={event.isMainEvent} onChange={(v) => updateEvent(event.id, { isMainEvent: v })} />
                      <ToggleRow label="Show Time" checked={event.showTime} onChange={(v) => updateEvent(event.id, { showTime: v })} />
                      <ToggleRow label="Show Venue" checked={event.showVenue} onChange={(v) => updateEvent(event.id, { showVenue: v })} />
                      <ToggleRow label="Show Description" checked={event.showDescription} onChange={(v) => updateEvent(event.id, { showDescription: v })} />
                      <ToggleRow label="Show Map Button" checked={event.showMapButton} onChange={(v) => updateEvent(event.id, { showMapButton: v })} />
                      <ToggleRow label="Show Countdown" checked={event.showCountdown} onChange={(v) => updateEvent(event.id, { showCountdown: v })} />
                      <ToggleRow label="Reminder Badge" checked={event.enableReminderBadge} onChange={(v) => updateEvent(event.id, { enableReminderBadge: v })} />
                    </div>
                    <SelectField
                      label="Event Status"
                      value={event.status}
                      onChange={(value) => updateEvent(event.id, { status: value as ScheduleEvent['status'] })}
                      options={SCHEDULE_STATUS_OPTIONS}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <input
          ref={eventBgRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && eventBgTargetId) void onUpload(file, { type: 'event-background', eventId: eventBgTargetId });
            e.target.value = '';
            setEventBgTargetId(null);
          }}
        />
      </Collapsible>

      <Collapsible title="Venue Information" defaultOpen={false}>
        {(
          [
            ['venueName', 'Venue Name'],
            ['venueAddress', 'Venue Address'],
            ['mapsUrl', 'Google Maps Link'],
            ['parkingInfo', 'Parking Information'],
            ['transportationDetails', 'Transportation Details'],
            ['shuttleService', 'Shuttle Service'],
            ['entranceInstructions', 'Entrance Instructions'],
            ['accessibilityNotes', 'Accessibility Notes'],
          ] as const
        ).map(([key, label]) => (
          <Field key={key} label={label}>
            <Input
              value={schedule.venueInfo[key]}
              onChange={(e) =>
                updateContent({ venueInfo: { ...schedule.venueInfo, [key]: e.target.value } })
              }
            />
          </Field>
        ))}
        {isValidMapsUrl(schedule.venueInfo.mapsUrl) && (
          <div className="flex items-center gap-2 rounded-xl bg-[#faf7f2] px-3 py-2 font-body text-xs text-[#6d625a]">
            <MapPin className="h-4 w-4 text-[#c5a67c]" />
            Get Directions will appear in the preview
          </div>
        )}
      </Collapsible>

      <Collapsible title="Dress Code" defaultOpen={false}>
        <SelectField
          label="Dress Code"
          value={schedule.dressCode.type}
          onChange={(value) =>
            updateContent({
              dressCode: { ...schedule.dressCode, type: value as typeof schedule.dressCode.type },
            })
          }
          options={DRESS_CODE_OPTIONS}
        />
        {schedule.dressCode.type === 'custom' && (
          <Field label="Custom Dress Code">
            <Input
              value={schedule.dressCode.customText}
              onChange={(e) =>
                updateContent({ dressCode: { ...schedule.dressCode, customText: e.target.value } })
              }
            />
          </Field>
        )}
        <div className="overflow-hidden rounded-xl border border-[#e8dfd6] bg-white">
          {schedule.dressCode.imageUrl ? (
            <img src={schedule.dressCode.imageUrl} alt="" className="aspect-video w-full object-cover" />
          ) : (
            <div className="flex aspect-video items-center justify-center font-body text-sm text-[#9e8e82]">
              Dress code reference image
            </div>
          )}
          <div className="flex gap-3 border-t border-[#e8dfd6] px-3 py-2">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => dressCodeRef.current?.click()}
              className="inline-flex items-center gap-1 font-body text-sm text-[#c5a67c] hover:underline disabled:opacity-50"
            >
              <ImagePlus className="h-4 w-4" />
              Upload image
            </button>
            {schedule.dressCode.imageUrl && (
              <button
                type="button"
                onClick={() => updateContent({ dressCode: { ...schedule.dressCode, imageUrl: null } })}
                className="font-body text-sm text-[#c45c5c] hover:underline"
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={dressCodeRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onUpload(file, { type: 'dress-code-image' });
              e.target.value = '';
            }}
          />
        </div>
      </Collapsible>

      <Collapsible title="Special Notes" defaultOpen={false}>
        {(
          [
            ['arrivalInstructions', 'Arrival Instructions'],
            ['weatherNotes', 'Weather Notes'],
            ['photographyPolicy', 'Photography Policy'],
            ['childrenPolicy', 'Children Policy'],
            ['ceremonyEtiquette', 'Ceremony Etiquette'],
            ['specialInstructions', 'Special Instructions'],
          ] as const
        ).map(([key, label]) => (
          <Field key={key} label={label}>
            <textarea
              value={schedule.specialNotes[key]}
              onChange={(e) =>
                updateContent({ specialNotes: { ...schedule.specialNotes, [key]: e.target.value } })
              }
              rows={2}
              placeholder={key === 'arrivalInstructions' ? 'Please arrive 30 minutes before the ceremony.' : ''}
              className="w-full rounded-lg border border-[#e8dfd6] px-3 py-2 font-body text-sm outline-none focus:border-[#c5a67c]"
            />
          </Field>
        ))}
      </Collapsible>

      <Collapsible title="Layout & Design" defaultOpen={false}>
        <SelectField
          label="Timeline Layout"
          value={schedule.layout}
          onChange={(value) => updateContent({ layout: value as ScheduleDetailsContent['layout'] })}
          options={SCHEDULE_LAYOUT_OPTIONS}
        />
        <SelectField
          label="Card Style"
          value={schedule.cardStyle}
          onChange={(value) => updateContent({ cardStyle: value as ScheduleDetailsContent['cardStyle'] })}
          options={SCHEDULE_CARD_STYLE_OPTIONS}
        />
        <SelectField
          label="Icon Style"
          value={schedule.iconStyle}
          onChange={(value) => updateContent({ iconStyle: value as ScheduleDetailsContent['iconStyle'] })}
          options={SCHEDULE_ICON_STYLE_OPTIONS}
        />
        <Field label="Background Color">
          <div className="flex items-center gap-3">
            <input type="color" value={schedule.backgroundColor} onChange={(e) => updateContent({ backgroundColor: e.target.value })} className="h-10 w-12 rounded border border-[#e8dfd6] bg-white" />
            <Input value={schedule.backgroundColor} onChange={(e) => updateContent({ backgroundColor: e.target.value })} />
          </div>
        </Field>
        <SliderField label="Overlay Opacity" value={Math.round(schedule.overlayOpacity * 100)} min={0} max={100} suffix="%" onChange={(v) => updateContent({ overlayOpacity: v / 100 })} />
        <Field label="Accent Color">
          <div className="flex items-center gap-3">
            <input type="color" value={schedule.accentColor} onChange={(e) => updateContent({ accentColor: e.target.value })} className="h-10 w-12 rounded border border-[#e8dfd6] bg-white" />
            <Input value={schedule.accentColor} onChange={(e) => updateContent({ accentColor: e.target.value })} />
          </div>
        </Field>
        <Field label="Timeline Line Color">
          <div className="flex items-center gap-3">
            <input type="color" value={schedule.timelineLineColor} onChange={(e) => updateContent({ timelineLineColor: e.target.value })} className="h-10 w-12 rounded border border-[#e8dfd6] bg-white" />
            <Input value={schedule.timelineLineColor} onChange={(e) => updateContent({ timelineLineColor: e.target.value })} />
          </div>
        </Field>
        <SliderField label="Border Radius" value={schedule.borderRadius} min={0} max={32} suffix="px" onChange={(v) => updateContent({ borderRadius: v })} />
        <SliderField label="Section Padding" value={schedule.sectionPadding} min={16} max={64} suffix="px" onChange={(v) => updateContent({ sectionPadding: v })} />
        <SelectField label="Font Family" value={schedule.fontFamily} onChange={(v) => updateContent({ fontFamily: v })} options={SCHEDULE_FONT_OPTIONS} />
        <SliderField label="Heading Size" value={schedule.headingFontSize} min={18} max={36} suffix="px" onChange={(v) => updateContent({ headingFontSize: v })} />
        <SliderField label="Body Font Size" value={schedule.bodyFontSize} min={10} max={18} suffix="px" onChange={(v) => updateContent({ bodyFontSize: v })} />
        <Field label="Text Color">
          <div className="flex items-center gap-3">
            <input type="color" value={schedule.textColor} onChange={(e) => updateContent({ textColor: e.target.value })} className="h-10 w-12 rounded border border-[#e8dfd6] bg-white" />
            <Input value={schedule.textColor} onChange={(e) => updateContent({ textColor: e.target.value })} />
          </div>
        </Field>
        <SelectField
          label="Animation"
          value={schedule.animation}
          onChange={(value) => updateContent({ animation: value as ScheduleDetailsContent['animation'] })}
          options={[
            { label: 'None', value: 'none' },
            { label: 'Fade In', value: 'fade-in' },
            { label: 'Slide Up', value: 'slide-up' },
            { label: 'Timeline Reveal', value: 'timeline-reveal' },
            { label: 'Scale', value: 'scale' },
          ]}
        />
      </Collapsible>
    </div>
  );
}
