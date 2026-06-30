import { useRef, useState, type ReactNode } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  GripVertical,
  ImagePlus,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Invitation, InvitationSection, RsvpAnalytics } from '@/types/api';
import {
  RSVP_FIELD_LABELS,
  RSVP_FONT_OPTIONS,
  TIMEZONE_OPTIONS,
  buildGuestCountPreview,
  createDietaryOption,
  createMealOption,
  parseRsvpDetails,
  reorderById,
  reorderFields,
  type RsvpDetailsContent,
  type RsvpFieldKey,
  type RsvpValidationResult,
} from '@/lib/rsvpSection';
import { cn } from '@/lib/utils';
import { EditorField } from '@/components/invitations/PublishValidationDialog';

export interface RsvpEditorChange {
  content?: Partial<RsvpDetailsContent>;
  rsvpDeadline?: string | null;
}

export type RsvpUploadTarget = { type: 'background' };

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface RsvpSectionEditorProps {
  section: InvitationSection;
  invitation: Invitation;
  validation: RsvpValidationResult;
  showValidation?: boolean;
  forcedOpenPanels?: Set<string>;
  analytics: RsvpAnalytics | null;
  analyticsLoading: boolean;
  isUploading: boolean;
  uploadProgress: number | null;
  saveStatus: SaveStatus;
  saveError: string | null;
  onChange: (patch: RsvpEditorChange) => void;
  onUpload: (file: File, target: RsvpUploadTarget) => void | Promise<void>;
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
        <span className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-[#6d625a]">{title}</span>
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
    <label className="flex items-center justify-between gap-4 py-1.5">
      <span className="font-body text-sm text-[#4e342e]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
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

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={cn('rounded-xl border border-[#e8dfd6] bg-white p-3', accent && 'border-[#c5a67c]/40 bg-[#faf7f2]')}>
      <p className="font-body text-[10px] uppercase tracking-wider text-[#9e8e82]">{label}</p>
      <p className="mt-1 font-display text-xl text-[#4e342e]">{value}</p>
    </div>
  );
}

export function RsvpSectionEditor({
  section,
  invitation,
  validation,
  showValidation = false,
  forcedOpenPanels,
  analytics,
  analyticsLoading,
  isUploading,
  uploadProgress,
  saveStatus,
  saveError,
  onChange,
  onUpload,
}: RsvpSectionEditorProps) {
  const rsvp = parseRsvpDetails(section, invitation);
  const fieldDragRef = useRef<RsvpFieldKey | null>(null);
  const mealDragRef = useRef<string | null>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const counts = buildGuestCountPreview(analytics, rsvp.maxCapacity, rsvp.plusOne.enabled);

  function updateContent(patch: Partial<RsvpDetailsContent>) {
    const nextPatch: RsvpEditorChange = { content: patch };
    if (patch.deadline?.date !== undefined) {
      nextPatch.rsvpDeadline = patch.deadline.date || null;
    }
    onChange(nextPatch);
  }

  function updateField(key: RsvpFieldKey, patch: Partial<(typeof rsvp.formFields)[0]>) {
    updateContent({
      formFields: rsvp.formFields.map((field) => (field.key === key ? { ...field, ...patch } : field)),
    });
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

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => updateContent({ previewVariant: 'form' })}
          className={cn(
            'flex-1 rounded-xl py-2 font-body text-xs font-semibold transition-colors',
            rsvp.previewVariant === 'form' ? 'bg-[#4e342e] text-white' : 'border border-[#e8dfd6] bg-white text-[#6d625a]',
          )}
        >
          Form Preview
        </button>
        <button
          type="button"
          onClick={() => updateContent({ previewVariant: 'success' })}
          className={cn(
            'flex-1 rounded-xl py-2 font-body text-xs font-semibold transition-colors',
            rsvp.previewVariant === 'success' ? 'bg-[#4e342e] text-white' : 'border border-[#e8dfd6] bg-white text-[#6d625a]',
          )}
        >
          Thank You
        </button>
      </div>

      <Collapsible title="Live Guest Count" defaultOpen>
        {analyticsLoading ? (
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="rsvp-skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Attending" value={counts.attending} accent />
              <StatCard label="Declined" value={counts.declined} />
              <StatCard label="Pending" value={counts.pending} />
              <StatCard label="Maybe" value={counts.maybe} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Remaining Seats" value={counts.remainingSeats} accent />
              <StatCard label="Plus Ones" value={counts.plusOneCount} />
            </div>
            <SliderField
              label="Max Capacity"
              value={rsvp.maxCapacity}
              min={10}
              max={500}
              onChange={(value) => updateContent({ maxCapacity: value })}
            />
          </>
        )}
      </Collapsible>

      <Collapsible title="RSVP Analytics" defaultOpen={false}>
        {analyticsLoading ? (
          <div className="rsvp-skeleton h-24 rounded-xl" />
        ) : analytics ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Total Guests" value={counts.totalGuests} />
              <StatCard label="Total Responses" value={counts.totalResponses} />
              <StatCard label="Response Rate" value={`${Math.round(counts.responseRate)}%`} accent />
              <StatCard label="Attending Guests" value={analytics.summary.totalAttendingCount} />
            </div>
            {Object.keys(counts.mealSummary).length > 0 && (
              <div>
                <p className="font-body text-xs font-semibold text-[#6d625a]">Meal Summary</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(counts.mealSummary).map(([meal, count]) => (
                    <span
                      key={meal}
                      className="rounded-full border border-[#e8dfd6] bg-white px-2.5 py-1 font-body text-[10px] text-[#6d625a]"
                    >
                      {meal}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="font-body text-xs text-[#9e8e82]">Analytics will appear once guests begin responding.</p>
        )}
      </Collapsible>

      <Collapsible title="Section Content" panelKey="rsvp-content" forcedOpenPanels={forcedOpenPanels} defaultOpen>
        <EditorField
          label="RSVP Title"
          fieldId="rsvp:sectionTitle"
          showValidation={showValidation}
          error={validation.errors.sectionTitle}
        >
          <Input
            value={rsvp.sectionTitle}
            onChange={(e) => updateContent({ sectionTitle: e.target.value })}
            placeholder="RSVP"
          />
        </EditorField>
        <Field label="Subtitle">
          <Input value={rsvp.subtitle} onChange={(e) => updateContent({ subtitle: e.target.value })} />
        </Field>
        <Field label="Welcome Message">
          <textarea
            value={rsvp.welcomeMessage}
            onChange={(e) => updateContent({ welcomeMessage: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-[#e8dfd6] bg-white px-3 py-2 font-body text-sm outline-none focus:border-[#c5a67c]"
          />
        </Field>
        <Field label="Description">
          <textarea
            value={rsvp.description}
            onChange={(e) => updateContent({ description: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-[#e8dfd6] bg-white px-3 py-2 font-body text-sm outline-none focus:border-[#c5a67c]"
          />
        </Field>
        <Field label="Thank You Title">
          <Input value={rsvp.thankYouTitle} onChange={(e) => updateContent({ thankYouTitle: e.target.value })} />
        </Field>
        <Field label="Thank You Message">
          <textarea
            value={rsvp.thankYouMessage}
            onChange={(e) => updateContent({ thankYouMessage: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-[#e8dfd6] bg-white px-3 py-2 font-body text-sm outline-none focus:border-[#c5a67c]"
          />
        </Field>
      </Collapsible>

      <Collapsible title="Form Builder">
        <p className="font-body text-xs text-[#9e8e82]">Drag to reorder. Toggle visibility and requirements per field.</p>
        <div className="space-y-2">
          {rsvp.formFields.map((field) => (
            <div
              key={field.key}
              draggable
              onDragStart={() => {
                fieldDragRef.current = field.key;
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                const dragKey = fieldDragRef.current;
                if (!dragKey) return;
                updateContent({ formFields: reorderFields(rsvp.formFields, dragKey, field.key) });
                fieldDragRef.current = null;
              }}
              className={cn(
                'rounded-xl border bg-white p-3',
                field.enabled ? 'border-[#e8dfd6]' : 'border-dashed border-[#e8dfd6] opacity-60',
              )}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-[#9e8e82]" />
                <p className="min-w-0 flex-1 font-body text-sm font-medium text-[#4e342e]">
                  {RSVP_FIELD_LABELS[field.key]}
                </p>
                <ToggleRow
                  label="Enabled"
                  checked={field.enabled}
                  onChange={(checked) => updateField(field.key, { enabled: checked })}
                />
              </div>
              {field.enabled && (
                <div className="mt-3 space-y-2 border-t border-[#e8dfd6] pt-3">
                  <ToggleRow label="Required" checked={field.required} onChange={(checked) => updateField(field.key, { required: checked })} />
                  <ToggleRow label="Visible" checked={field.visible} onChange={(checked) => updateField(field.key, { visible: checked })} />
                  {field.key !== 'attendance' && field.key !== 'dietaryRestrictions' && (
                    <Field label="Placeholder">
                      <Input
                        value={field.placeholder}
                        onChange={(e) => updateField(field.key, { placeholder: e.target.value })}
                      />
                    </Field>
                  )}
                  <Field label="Help Text">
                    <Input value={field.helpText} onChange={(e) => updateField(field.key, { helpText: e.target.value })} />
                  </Field>
                </div>
              )}
            </div>
          ))}
        </div>
      </Collapsible>

      <Collapsible title="Attendance Options" panelKey="rsvp-attendance" forcedOpenPanels={forcedOpenPanels}>
        <div data-validation-field="rsvp:attendance">
        {showValidation && validation.errors.attendance && (
          <p className="rounded-lg bg-red-50 px-3 py-2 font-body text-xs text-red-600" role="alert">
            {validation.errors.attendance}
          </p>
        )}
        {rsvp.attendanceOptions.map((option) => (
          <div key={option.key} className="space-y-2 rounded-xl border border-[#e8dfd6] bg-white p-3">
            <ToggleRow
              label={option.key === 'attending' ? 'Joyfully Accept' : option.key === 'declined' ? 'Regretfully Decline' : 'Maybe'}
              checked={option.enabled}
              onChange={(checked) =>
                updateContent({
                  attendanceOptions: rsvp.attendanceOptions.map((item) =>
                    item.key === option.key ? { ...item, enabled: checked } : item,
                  ),
                })
              }
            />
            {option.enabled && (
              <Field label="Custom Label">
                <Input
                  value={option.label}
                  onChange={(e) =>
                    updateContent({
                      attendanceOptions: rsvp.attendanceOptions.map((item) =>
                        item.key === option.key ? { ...item, label: e.target.value } : item,
                      ),
                    })
                  }
                />
              </Field>
            )}
          </div>
        ))}
        </div>
      </Collapsible>

      <Collapsible title="Plus One" panelKey="rsvp-plus-one" forcedOpenPanels={forcedOpenPanels} defaultOpen={false}>
        <ToggleRow
          label="Enable Plus One"
          checked={rsvp.plusOne.enabled}
          onChange={(checked) => updateContent({ plusOne: { ...rsvp.plusOne, enabled: checked } })}
        />
        {rsvp.plusOne.enabled && (
          <>
            <SliderField
              label="Maximum Plus Ones"
              value={rsvp.plusOne.maxPlusOnes}
              min={0}
              max={5}
              onChange={(value) => updateContent({ plusOne: { ...rsvp.plusOne, maxPlusOnes: value } })}
            />
            <ToggleRow
              label="Require Plus One Name"
              checked={rsvp.plusOne.requireName}
              onChange={(checked) => updateContent({ plusOne: { ...rsvp.plusOne, requireName: checked } })}
            />
            <ToggleRow
              label="Require Plus One Meal"
              checked={rsvp.plusOne.requireMeal}
              onChange={(checked) => updateContent({ plusOne: { ...rsvp.plusOne, requireMeal: checked } })}
            />
            <ToggleRow
              label="Require Plus One RSVP"
              checked={rsvp.plusOne.requireRsvp}
              onChange={(checked) => updateContent({ plusOne: { ...rsvp.plusOne, requireRsvp: checked } })}
            />
          </>
        )}
      </Collapsible>

      <Collapsible title="Meals" panelKey="rsvp-meals" forcedOpenPanels={forcedOpenPanels} defaultOpen={false}>
        <div data-validation-field="rsvp:meals">
        {showValidation && validation.errors.meals && (
          <p className="rounded-lg bg-red-50 px-3 py-2 font-body text-xs text-red-600" role="alert">
            {validation.errors.meals}
          </p>
        )}
        <div className="space-y-2">
          {rsvp.meals.map((meal) => (
            <div
              key={meal.id}
              draggable
              onDragStart={() => {
                mealDragRef.current = meal.id;
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                const dragId = mealDragRef.current;
                if (!dragId) return;
                updateContent({ meals: reorderById(rsvp.meals, dragId, meal.id) });
                mealDragRef.current = null;
              }}
              className="flex items-center gap-2 rounded-xl border border-[#e8dfd6] bg-white p-2"
            >
              <GripVertical className="h-4 w-4 cursor-grab text-[#9e8e82]" />
              <Input
                value={meal.label}
                onChange={(e) =>
                  updateContent({
                    meals: rsvp.meals.map((item) => (item.id === meal.id ? { ...item, label: e.target.value } : item)),
                  })
                }
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => updateContent({ meals: rsvp.meals.filter((item) => item.id !== meal.id) })}
                className="rounded p-1 text-[#c45c5c] hover:bg-red-50"
                aria-label="Delete meal"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => updateContent({ meals: [...rsvp.meals, createMealOption()] })}
          className="inline-flex items-center gap-1 font-body text-xs font-semibold text-[#c5a67c] hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          Add meal
        </button>

        <div className="border-t border-[#e8dfd6] pt-4">
          <p className="font-body text-xs font-semibold text-[#6d625a]">Dietary Restrictions</p>
          <div className="mt-2 space-y-2">
            {rsvp.dietaryOptions.map((option) => (
              <div key={option.id} className="flex items-center gap-2">
                <Input
                  value={option.label}
                  onChange={(e) =>
                    updateContent({
                      dietaryOptions: rsvp.dietaryOptions.map((item) =>
                        item.id === option.id ? { ...item, label: e.target.value } : item,
                      ),
                    })
                  }
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateContent({ dietaryOptions: rsvp.dietaryOptions.filter((item) => item.id !== option.id) })
                  }
                  className="rounded p-1 text-[#c45c5c] hover:bg-red-50"
                  aria-label="Delete dietary option"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => updateContent({ dietaryOptions: [...rsvp.dietaryOptions, createDietaryOption()] })}
            className="mt-2 inline-flex items-center gap-1 font-body text-xs font-semibold text-[#c5a67c] hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Add dietary option
          </button>
        </div>
        </div>
      </Collapsible>

      <Collapsible title="Song Requests" defaultOpen={false}>
        <ToggleRow
          label="Enable Song Requests"
          checked={rsvp.songRequest.enabled}
          onChange={(checked) => updateContent({ songRequest: { ...rsvp.songRequest, enabled: checked } })}
        />
        {rsvp.songRequest.enabled && (
          <SliderField
            label="Max Characters"
            value={rsvp.songRequest.maxCharacters}
            min={50}
            max={500}
            onChange={(value) => updateContent({ songRequest: { ...rsvp.songRequest, maxCharacters: value } })}
          />
        )}
      </Collapsible>

      <Collapsible title="RSVP Deadline" panelKey="rsvp-deadline" forcedOpenPanels={forcedOpenPanels}>
        <EditorField
          label="Deadline Date"
          fieldId="rsvp:deadline"
          showValidation={showValidation}
          error={validation.errors.deadline}
        >
          <Input
            type="date"
            value={rsvp.deadline.date}
            onChange={(e) =>
              updateContent({ deadline: { ...rsvp.deadline, date: e.target.value } })
            }
          />
        </EditorField>
        <Field label="Deadline Time">
          <Input
            type="time"
            value={rsvp.deadline.time}
            onChange={(e) => updateContent({ deadline: { ...rsvp.deadline, time: e.target.value } })}
          />
        </Field>
        <Field label="Time Zone">
          <select
            value={rsvp.deadline.timezone}
            onChange={(e) => updateContent({ deadline: { ...rsvp.deadline, timezone: e.target.value } })}
            className="h-11 w-full rounded-lg border border-[#e8dfd6] bg-white px-3 font-body text-sm outline-none focus:border-[#c5a67c]"
          >
            {TIMEZONE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <ToggleRow
          label="Allow guests to edit RSVP before deadline"
          checked={rsvp.allowEditBeforeDeadline}
          onChange={(checked) => updateContent({ allowEditBeforeDeadline: checked })}
        />
      </Collapsible>

      <Collapsible title="Success Screen" defaultOpen={false}>
        <ToggleRow
          label="Show QR Code"
          checked={rsvp.successScreen.showQrCode}
          onChange={(checked) =>
            updateContent({ successScreen: { ...rsvp.successScreen, showQrCode: checked } })
          }
        />
        <ToggleRow
          label="Download Invitation"
          checked={rsvp.successScreen.showDownloadInvitation}
          onChange={(checked) =>
            updateContent({ successScreen: { ...rsvp.successScreen, showDownloadInvitation: checked } })
          }
        />
        <ToggleRow
          label="Add to Calendar Button"
          checked={rsvp.successScreen.showAddToCalendar}
          onChange={(checked) =>
            updateContent({ successScreen: { ...rsvp.successScreen, showAddToCalendar: checked } })
          }
        />
      </Collapsible>

      <Collapsible title="Add to Calendar" defaultOpen={false}>
        <ToggleRow label="Google Calendar" checked={rsvp.calendar.google} onChange={(checked) => updateContent({ calendar: { ...rsvp.calendar, google: checked } })} />
        <ToggleRow label="Apple Calendar (.ics)" checked={rsvp.calendar.apple} onChange={(checked) => updateContent({ calendar: { ...rsvp.calendar, apple: checked } })} />
        <ToggleRow label="Outlook" checked={rsvp.calendar.outlook} onChange={(checked) => updateContent({ calendar: { ...rsvp.calendar, outlook: checked } })} />
        <ToggleRow label="Yahoo Calendar" checked={rsvp.calendar.yahoo} onChange={(checked) => updateContent({ calendar: { ...rsvp.calendar, yahoo: checked } })} />
      </Collapsible>

      <Collapsible title="Design Settings" defaultOpen={false}>
        <Field label="Background Color">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={rsvp.backgroundColor}
              onChange={(e) => updateContent({ backgroundColor: e.target.value })}
              className="h-10 w-12 cursor-pointer rounded border border-[#e8dfd6] bg-white"
            />
            <Input value={rsvp.backgroundColor} onChange={(e) => updateContent({ backgroundColor: e.target.value })} />
          </div>
        </Field>
        <div className="overflow-hidden rounded-xl border border-[#e8dfd6]">
          {rsvp.backgroundImageUrl ? (
            <img src={rsvp.backgroundImageUrl} alt="" className="aspect-video w-full object-cover" />
          ) : (
            <div className="flex aspect-video items-center justify-center bg-[#faf7f2] font-body text-sm text-[#9e8e82]">
              No background image
            </div>
          )}
          <div className="flex gap-4 border-t border-[#e8dfd6] px-3 py-2">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => backgroundInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 font-body text-sm text-[#c5a67c] hover:underline disabled:opacity-50"
            >
              <ImagePlus className="h-4 w-4" />
              Upload
            </button>
            {rsvp.backgroundImageUrl && (
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
            ref={backgroundInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onUpload(file, { type: 'background' });
              e.target.value = '';
            }}
          />
        </div>
        <SliderField
          label="Overlay Opacity"
          value={Math.round(rsvp.overlayOpacity * 100)}
          min={0}
          max={100}
          suffix="%"
          onChange={(value) => updateContent({ overlayOpacity: value / 100 })}
        />
        <Field label="Accent Color">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={rsvp.accentColor}
              onChange={(e) => updateContent({ accentColor: e.target.value })}
              className="h-10 w-12 cursor-pointer rounded border border-[#e8dfd6] bg-white"
            />
            <Input value={rsvp.accentColor} onChange={(e) => updateContent({ accentColor: e.target.value })} />
          </div>
        </Field>
        <SliderField label="Section Padding" value={rsvp.sectionPadding} min={16} max={64} suffix="px" onChange={(value) => updateContent({ sectionPadding: value })} />
        <SliderField label="Heading Size" value={rsvp.headingFontSize} min={18} max={36} suffix="px" onChange={(value) => updateContent({ headingFontSize: value })} />
        <SliderField label="Body Font Size" value={rsvp.bodyFontSize} min={11} max={18} suffix="px" onChange={(value) => updateContent({ bodyFontSize: value })} />
        <Field label="Font Family">
          <select
            value={rsvp.fontFamily}
            onChange={(e) => updateContent({ fontFamily: e.target.value })}
            className="h-11 w-full rounded-lg border border-[#e8dfd6] bg-white px-3 font-body text-sm outline-none focus:border-[#c5a67c]"
          >
            {RSVP_FONT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Input Style">
          <select
            value={rsvp.inputStyle}
            onChange={(e) => updateContent({ inputStyle: e.target.value as RsvpDetailsContent['inputStyle'] })}
            className="h-11 w-full rounded-lg border border-[#e8dfd6] bg-white px-3 font-body text-sm outline-none focus:border-[#c5a67c]"
          >
            <option value="glass">Glass</option>
            <option value="outlined">Outlined</option>
            <option value="filled">Filled</option>
            <option value="minimal">Minimal</option>
          </select>
        </Field>
      </Collapsible>

      <Collapsible title="Button Settings" defaultOpen={false}>
        <Field label="Button Text">
          <Input value={rsvp.button.text} onChange={(e) => updateContent({ button: { ...rsvp.button, text: e.target.value } })} />
        </Field>
        <Field label="Button Color">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={rsvp.button.color}
              onChange={(e) => updateContent({ button: { ...rsvp.button, color: e.target.value } })}
              className="h-10 w-12 cursor-pointer rounded border border-[#e8dfd6] bg-white"
            />
            <Input
              value={rsvp.button.color}
              onChange={(e) => updateContent({ button: { ...rsvp.button, color: e.target.value } })}
            />
          </div>
        </Field>
        <SliderField
          label="Button Radius"
          value={rsvp.button.borderRadius}
          min={4}
          max={999}
          suffix="px"
          onChange={(value) => updateContent({ button: { ...rsvp.button, borderRadius: value } })}
        />
        <Field label="Hover Animation">
          <select
            value={rsvp.button.hoverAnimation}
            onChange={(e) =>
              updateContent({
                button: { ...rsvp.button, hoverAnimation: e.target.value as RsvpDetailsContent['button']['hoverAnimation'] },
              })
            }
            className="h-11 w-full rounded-lg border border-[#e8dfd6] bg-white px-3 font-body text-sm outline-none focus:border-[#c5a67c]"
          >
            <option value="none">None</option>
            <option value="lift">Lift</option>
            <option value="glow">Glow</option>
            <option value="scale">Scale</option>
          </select>
        </Field>
        <ToggleRow
          label="Show Loading State"
          checked={rsvp.button.showLoadingState}
          onChange={(checked) => updateContent({ button: { ...rsvp.button, showLoadingState: checked } })}
        />
        <Field label="Button Style">
          <select
            value={rsvp.buttonStyle}
            onChange={(e) => updateContent({ buttonStyle: e.target.value as RsvpDetailsContent['buttonStyle'] })}
            className="h-11 w-full rounded-lg border border-[#e8dfd6] bg-white px-3 font-body text-sm outline-none focus:border-[#c5a67c]"
          >
            <option value="solid">Solid</option>
            <option value="outline">Outline</option>
            <option value="ghost">Ghost</option>
          </select>
        </Field>
      </Collapsible>
    </div>
  );
}
