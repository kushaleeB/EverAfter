import { useRef } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Invitation, InvitationSection } from '@/types/api';
import {
  FONT_FAMILY_OPTIONS,
  INVITATION_TITLE_OPTIONS,
  parseHeroDetails,
  type HeroDetailsContent,
  type HeroValidationResult,
} from '@/lib/heroSection';
import { cn } from '@/lib/utils';
import { EditorField } from '@/components/invitations/PublishValidationDialog';

export interface HeroEditorChange {
  headline?: string;
  subheadline?: string;
  content?: Partial<HeroDetailsContent>;
}

interface HeroSectionEditorProps {
  invitation: Invitation;
  section: InvitationSection;
  validation: HeroValidationResult;
  showValidation?: boolean;
  isUploading: boolean;
  onChange: (patch: HeroEditorChange) => void;
  onUploadImage: (file: File) => void;
  onRemoveImage: () => void;
}

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
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="font-body text-xs text-[#6d625a]">{label}</label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 font-body text-xs text-red-600">{error}</p>}
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

export function HeroSectionEditor({
  invitation,
  section,
  validation,
  showValidation = false,
  isUploading,
  onChange,
  onUploadImage,
  onRemoveImage,
}: HeroSectionEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hero = parseHeroDetails(section, invitation);

  function updateContent(patch: Partial<HeroDetailsContent>) {
    onChange({ content: patch });
  }

  return (
    <div className="space-y-8">
      <div>
        <SectionLabel>Content</SectionLabel>
        <div className="mt-3 space-y-4">
          <EditorField
            label="Couple Names"
            fieldId="hero:coupleNames"
            showValidation={showValidation}
            error={validation.errors.coupleNames}
          >
            <Input
              value={invitation.headline ?? ''}
              onChange={(e) => onChange({ headline: e.target.value })}
              placeholder="Sophia & James"
            />
          </EditorField>
          <SelectField
            label="Invitation Title"
            value={hero.invitationTitle}
            onChange={(value) => updateContent({ invitationTitle: value })}
            options={INVITATION_TITLE_OPTIONS.map((title) => ({ label: title, value: title }))}
          />
          <Field label="Subtitle">
            <Input
              value={invitation.subheadline ?? ''}
              onChange={(e) => onChange({ subheadline: e.target.value })}
              placeholder="Are getting married"
            />
          </Field>
          <EditorField
            label="Wedding Date"
            fieldId="hero:weddingDate"
            showValidation={showValidation}
            error={validation.errors.weddingDate}
          >
            <Input
              type="date"
              value={hero.weddingDate}
              onChange={(e) => updateContent({ weddingDate: e.target.value })}
            />
          </EditorField>
          <Field label="Wedding Time">
            <Input
              value={hero.weddingTime}
              onChange={(e) => updateContent({ weddingTime: e.target.value })}
              placeholder="4:00 PM"
            />
          </Field>
          <EditorField
            label="Venue Name"
            fieldId="hero:venueName"
            showValidation={showValidation}
            error={validation.errors.venueName}
          >
            <Input
              value={hero.venueName}
              onChange={(e) => updateContent({ venueName: e.target.value })}
              placeholder="The Botanical Gardens"
            />
          </EditorField>
          <Field label="Venue Address">
            <Input
              value={hero.venueAddress}
              onChange={(e) => updateContent({ venueAddress: e.target.value })}
              placeholder="123 Conservatory Way, Brooklyn, NY"
            />
          </Field>
          <Field label="CTA Button Text (optional)">
            <Input
              value={hero.ctaText}
              onChange={(e) => updateContent({ ctaText: e.target.value })}
              placeholder="RSVP Now"
            />
          </Field>
        </div>
      </div>

      <div>
        <SectionLabel>Background</SectionLabel>
        <div className="mt-3 overflow-hidden rounded-xl border border-[#e8dfd6]">
          {hero.imageUrl ? (
            <img src={hero.imageUrl} alt="" className="aspect-video w-full object-cover" />
          ) : (
            <div className="flex aspect-video items-center justify-center bg-[#faf7f2] font-body text-sm text-[#9e8e82]">
              No background image
            </div>
          )}
          <div className="flex items-center gap-4 border-t border-[#e8dfd6] px-3 py-2">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 font-body text-sm text-[#c5a67c] hover:underline disabled:opacity-50"
            >
              <ImagePlus className="h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Replace'}
            </button>
            {hero.imageUrl && (
              <button
                type="button"
                onClick={onRemoveImage}
                className="inline-flex items-center gap-1.5 font-body text-sm text-[#c45c5c] hover:underline"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadImage(file);
                e.target.value = '';
              }}
            />
          </div>
        </div>
        <div className="mt-4 space-y-4">
          <SliderField
            label="Overlay Opacity"
            value={Math.round(hero.overlayOpacity * 100)}
            min={0}
            max={100}
            suffix="%"
            onChange={(value) => updateContent({ overlayOpacity: value / 100 })}
          />
          <SelectField
            label="Background Position"
            value={hero.backgroundPosition}
            onChange={(value) =>
              updateContent({ backgroundPosition: value as HeroDetailsContent['backgroundPosition'] })
            }
            options={[
              { label: 'Center', value: 'center' },
              { label: 'Top', value: 'top' },
              { label: 'Bottom', value: 'bottom' },
            ]}
          />
          <SelectField
            label="Background Size"
            value={hero.backgroundSize}
            onChange={(value) =>
              updateContent({ backgroundSize: value as HeroDetailsContent['backgroundSize'] })
            }
            options={[
              { label: 'Cover', value: 'cover' },
              { label: 'Contain', value: 'contain' },
            ]}
          />
        </div>
      </div>

      <div>
        <SectionLabel>Typography</SectionLabel>
        <div className="mt-3 space-y-4">
          <SelectField
            label="Font Family"
            value={hero.fontFamily}
            onChange={(value) => updateContent({ fontFamily: value })}
            options={FONT_FAMILY_OPTIONS}
          />
          <SliderField
            label="Title Font Size"
            value={hero.titleFontSize}
            min={18}
            max={42}
            suffix="px"
            onChange={(value) => updateContent({ titleFontSize: value })}
          />
          <SliderField
            label="Subtitle Font Size"
            value={hero.subtitleFontSize}
            min={8}
            max={16}
            suffix="px"
            onChange={(value) => updateContent({ subtitleFontSize: value })}
          />
          <Field label="Text Color">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={hero.textColor}
                onChange={(e) => updateContent({ textColor: e.target.value })}
                className="h-10 w-12 cursor-pointer rounded border border-[#e8dfd6] bg-white"
              />
              <Input
                value={hero.textColor}
                onChange={(e) => updateContent({ textColor: e.target.value })}
              />
            </div>
          </Field>
          <SelectField
            label="Text Alignment"
            value={hero.textAlign}
            onChange={(value) =>
              updateContent({ textAlign: value as HeroDetailsContent['textAlign'] })
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
        <SectionLabel>Layout</SectionLabel>
        <div className="mt-2 space-y-1">
          <ToggleRow
            label="Full Height"
            checked={hero.fullHeight}
            onChange={(checked) => updateContent({ fullHeight: checked })}
          />
          <ToggleRow
            label="Show Subtitle"
            checked={hero.showSubheading}
            onChange={(checked) => updateContent({ showSubheading: checked })}
          />
          <ToggleRow
            label="Show Date"
            checked={hero.showDate}
            onChange={(checked) => updateContent({ showDate: checked })}
          />
          <ToggleRow
            label="Show Venue"
            checked={hero.showVenue}
            onChange={(checked) => updateContent({ showVenue: checked })}
          />
        </div>
        <div className="mt-4 space-y-4">
          <SelectField
            label="Vertical Content Position"
            value={hero.verticalPosition}
            onChange={(value) =>
              updateContent({ verticalPosition: value as HeroDetailsContent['verticalPosition'] })
            }
            options={[
              { label: 'Top', value: 'top' },
              { label: 'Center', value: 'center' },
              { label: 'Bottom', value: 'bottom' },
            ]}
          />
          <SelectField
            label="Content Width"
            value={hero.contentWidth}
            onChange={(value) =>
              updateContent({ contentWidth: value as HeroDetailsContent['contentWidth'] })
            }
            options={[
              { label: 'Narrow', value: 'narrow' },
              { label: 'Default', value: 'default' },
              { label: 'Wide', value: 'wide' },
            ]}
          />
        </div>
      </div>

      <div>
        <SectionLabel>Styling</SectionLabel>
        <div className="mt-3 space-y-4">
          <SliderField
            label="Section Spacing"
            value={hero.sectionSpacing}
            min={8}
            max={48}
            suffix="px"
            onChange={(value) => updateContent({ sectionSpacing: value })}
          />
          <SliderField
            label="Border Radius"
            value={hero.borderRadius}
            min={0}
            max={32}
            suffix="px"
            onChange={(value) => updateContent({ borderRadius: value })}
          />
          <SliderField
            label="Hero Height"
            value={hero.heroHeight}
            min={240}
            max={520}
            suffix="px"
            onChange={(value) => updateContent({ heroHeight: value })}
          />
          <SelectField
            label="Animation"
            value={hero.animation}
            onChange={(value) =>
              updateContent({ animation: value as HeroDetailsContent['animation'] })
            }
            options={[
              { label: 'None', value: 'none' },
              { label: 'Fade In', value: 'fade-in' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
