import { useEffect, useRef, useState, type DragEvent, type ReactNode } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Copy,
  GripVertical,
  ImagePlus,
  Images,
  Plus,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { InvitationSection } from '@/types/api';
import {
  ALBUM_TYPE_OPTIONS,
  GALLERY_FONT_OPTIONS,
  GALLERY_LAYOUT_OPTIONS,
  MAX_GALLERY_UPLOAD_MB,
  albumTypeLabel,
  createGalleryAlbum,
  duplicateGalleryImage,
  getImagesForAlbum,
  parseGalleryDetails,
  validateGalleryFile,
  type GalleryDetailsContent,
  type GalleryImage,
  type GalleryValidationResult,
} from '@/lib/gallerySection';
import { cn } from '@/lib/utils';
import { EditorField } from '@/components/invitations/PublishValidationDialog';

export interface GalleryEditorChange {
  content?: Partial<GalleryDetailsContent>;
}

export type GalleryUploadTarget =
  | { type: 'photo'; albumId: string; replaceId?: string }
  | { type: 'background' }
  | { type: 'album-cover'; albumId: string };

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface GallerySectionEditorProps {
  section: InvitationSection;
  validation: GalleryValidationResult;
  showValidation?: boolean;
  forcedOpenPanels?: Set<string>;
  isUploading: boolean;
  uploadProgress: number | null;
  saveStatus: SaveStatus;
  saveError: string | null;
  onChange: (patch: GalleryEditorChange) => void;
  onUpload: (file: File, target: GalleryUploadTarget) => void | Promise<void>;
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

function LocalToast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className={cn(
        'rounded-xl px-3 py-2 font-body text-xs',
        type === 'error' ? 'bg-red-50 text-red-700' : 'bg-[#e8f5e9] text-[#2e7d32]',
      )}
      role="status"
    >
      {message}
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

export function GallerySectionEditor({
  section,
  validation,
  showValidation = false,
  forcedOpenPanels,
  isUploading,
  uploadProgress,
  saveStatus,
  saveError,
  onChange,
  onUpload,
}: GallerySectionEditorProps) {
  const gallery = parseGalleryDetails(section);
  const dragIdRef = useRef<string | null>(null);
  const albumDragIdRef = useRef<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const albumCoverInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [replacePhotoId, setReplacePhotoId] = useState<string | null>(null);
  const [albumCoverTargetId, setAlbumCoverTargetId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDragOver, setIsDragOver] = useState(false);
  const [localToast, setLocalToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const activeAlbumId = gallery.selectedAlbumId ?? gallery.albums[0]?.id ?? null;
  const albumImages = activeAlbumId ? getImagesForAlbum(gallery.images, activeAlbumId) : gallery.images;
  const atImageLimit = gallery.images.length >= gallery.maxImages;

  useEffect(() => {
    if (!localToast) return;
    const timer = window.setTimeout(() => setLocalToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [localToast]);

  function updateContent(patch: Partial<GalleryDetailsContent>) {
    onChange({ content: patch });
  }

  function updateImages(images: GalleryImage[]) {
    updateContent({ images });
  }

  function updateImage(imageId: string, patch: Partial<GalleryImage>) {
    let next = gallery.images.map((image) => (image.id === imageId ? { ...image, ...patch } : image));

    if (patch.isCover) {
      next = next.map((image) =>
        image.albumId === (patch.albumId ?? next.find((i) => i.id === imageId)?.albumId)
          ? { ...image, isCover: image.id === imageId }
          : image,
      );
    }

    updateImages(next);
  }

  function moveImageToAlbum(imageId: string, albumId: string) {
    updateImage(imageId, { albumId, isCover: false });
  }

  function deleteAlbum(albumId: string) {
    const remaining = gallery.albums.filter((album) => album.id !== albumId);
    if (remaining.length === 0) return;
    const fallbackId = remaining[0].id;
    updateContent({
      albums: remaining,
      selectedAlbumId: gallery.selectedAlbumId === albumId ? fallbackId : gallery.selectedAlbumId,
      images: gallery.images.map((image) =>
        image.albumId === albumId ? { ...image, albumId: fallbackId, isCover: false } : image,
      ),
    });
    setLocalToast({ message: 'Album deleted.', type: 'success' });
  }

  function reorderAlbums(fromId: string, toId: string) {
    updateContent({ albums: reorderItems(gallery.albums, fromId, toId) });
  }

  function toggleSelect(imageId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(imageId)) next.delete(imageId);
      else next.add(imageId);
      return next;
    });
  }

  function selectAllInAlbum() {
    setSelectedIds(new Set(albumImages.map((image) => image.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function bulkDelete() {
    if (selectedIds.size === 0) return;
    updateImages(gallery.images.filter((image) => !selectedIds.has(image.id)));
    setSelectedIds(new Set());
    setLocalToast({ message: `${selectedIds.size} photo(s) deleted.`, type: 'success' });
  }

  function bulkMoveToAlbum(albumId: string) {
    if (selectedIds.size === 0) return;
    updateImages(
      gallery.images.map((image) =>
        selectedIds.has(image.id) ? { ...image, albumId, isCover: false } : image,
      ),
    );
    setSelectedIds(new Set());
    setLocalToast({ message: 'Photos moved to album.', type: 'success' });
  }

  async function handleFiles(files: File[], replaceId?: string | null) {
    if (!activeAlbumId) return;

    const remaining = gallery.maxImages - gallery.images.length + (replaceId ? 1 : 0);
    const toUpload = replaceId ? files.slice(0, 1) : files.slice(0, remaining);

    if (!replaceId && files.length > remaining) {
      setLocalToast({
        message: `Only ${remaining} more photo(s) allowed (max ${gallery.maxImages}).`,
        type: 'error',
      });
    }

    for (const file of toUpload) {
      const fileError = validateGalleryFile(file);
      if (fileError) {
        setLocalToast({ message: fileError, type: 'error' });
        continue;
      }
      await onUpload(file, {
        type: 'photo',
        albumId: activeAlbumId,
        ...(replaceId ? { replaceId } : {}),
      });
    }

    if (toUpload.length > 0 && !replaceId) {
      setLocalToast({ message: `${toUpload.length} photo(s) uploaded.`, type: 'success' });
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith('image/'));
    if (files.length === 0) {
      setLocalToast({ message: 'Please drop image files only.', type: 'error' });
      return;
    }
    void handleFiles(files, replacePhotoId);
    setReplacePhotoId(null);
  }

  function openPhotoPicker() {
    setReplacePhotoId(null);
    photoInputRef.current?.click();
  }

  const activeAlbum = gallery.albums.find((album) => album.id === activeAlbumId);
  const hasNoPhotos = gallery.images.length === 0;

  return (
    <div className="space-y-5">
      <EditorToast saveStatus={saveStatus} saveError={saveError} />
      {localToast && <LocalToast message={localToast.message} type={localToast.type} />}

      {isUploading && uploadProgress !== null && (
        <div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#e8dfd6]">
            <div
              className="h-full bg-[#c5a67c] transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="mt-1 font-body text-xs text-[#9e8e82]">Uploading… {uploadProgress}%</p>
        </div>
      )}

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple={!replacePhotoId}
        className="hidden"
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          await handleFiles(files, replacePhotoId);
          e.target.value = '';
          setReplacePhotoId(null);
        }}
      />

      <Collapsible
        title={`Photos${gallery.images.length > 0 ? ` (${gallery.images.length})` : ''}`}
        panelKey="gallery-photos"
        forcedOpenPanels={forcedOpenPanels}
        defaultOpen
      >
        <div data-validation-field="gallery:images">
          {showValidation && validation.errors.images && (
            <p className="rounded-lg bg-red-50 px-3 py-2 font-body text-xs text-red-600" role="alert">
              {validation.errors.images}
            </p>
          )}
          {showValidation && validation.errors.maxImages && (
            <p className="rounded-lg bg-red-50 px-3 py-2 font-body text-xs text-red-600" role="alert">
              {validation.errors.maxImages}
            </p>
          )}

          {hasNoPhotos && (
            <p className="font-body text-xs text-[#6d625a]">
              Upload at least one photo to publish your invitation.
            </p>
          )}

          {activeAlbum && (
            <Field label="Upload to album">
              <select
                value={activeAlbumId ?? ''}
                onChange={(e) => updateContent({ selectedAlbumId: e.target.value })}
                className="h-11 w-full rounded-lg border border-[#e8dfd6] bg-white px-3 font-body text-sm text-[#4e342e] outline-none focus:border-[#c5a67c]"
              >
                {gallery.albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {albumTypeLabel(album)}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <div
            ref={dropZoneRef}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              'rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors',
              isDragOver
                ? 'border-[#c5a67c] bg-[#c5a67c]/10'
                : showValidation && validation.errors.images
                  ? 'border-red-300 bg-red-50/30'
                  : hasNoPhotos
                    ? 'border-[#c5a67c]/50 bg-[#faf7f2]'
                    : 'border-[#e8dfd6] bg-white/50',
              (isUploading || atImageLimit || !activeAlbumId) && 'pointer-events-none opacity-60',
            )}
          >
            <Upload className="mx-auto h-8 w-8 text-[#c5a67c]" />
            <p className="mt-3 font-body text-sm font-medium text-[#4e342e]">Drag & drop photos here</p>
            <p className="mt-1 font-body text-xs text-[#9e8e82]">
              JPEG, PNG, WebP · Max {MAX_GALLERY_UPLOAD_MB}MB · {gallery.images.length}/{gallery.maxImages} photos
            </p>
            <button
              type="button"
              disabled={isUploading || atImageLimit || !activeAlbumId}
              onClick={openPhotoPicker}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#4e342e] px-5 py-2.5 font-body text-xs font-semibold text-white hover:bg-[#3d2a25] disabled:opacity-50"
            >
              <ImagePlus className="h-4 w-4" />
              Upload photos
            </button>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#c5a67c]/30 bg-[#c5a67c]/10 px-3 py-2">
              <span className="font-body text-xs font-medium text-[#4e342e]">
                {selectedIds.size} selected
              </span>
              <button
                type="button"
                onClick={bulkDelete}
                className="inline-flex items-center gap-1 font-body text-xs text-[#c45c5c] hover:underline"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
              <select
                className="h-8 rounded-lg border border-[#e8dfd6] bg-white px-2 font-body text-xs text-[#4e342e]"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) bulkMoveToAlbum(e.target.value);
                  e.target.value = '';
                }}
              >
                <option value="" disabled>
                  Move to album
                </option>
                {gallery.albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {albumTypeLabel(album)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={clearSelection}
                className="font-body text-xs text-[#9e8e82] hover:underline"
              >
                Clear
              </button>
            </div>
          )}

          {albumImages.length > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={selectAllInAlbum}
                className="font-body text-xs text-[#c5a67c] hover:underline"
              >
                Select all in album
              </button>
            </div>
          )}

          <div className="space-y-3">
            {albumImages.length === 0 ? (
              <p className="py-2 text-center font-body text-xs italic text-[#9e8e82]">
                No photos in {activeAlbum ? albumTypeLabel(activeAlbum) : 'this album'} yet.
              </p>
            ) : (
              albumImages.map((image) => (
                <div
                  key={image.id}
                  draggable
                  onDragStart={() => {
                    dragIdRef.current = image.id;
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    const dragId = dragIdRef.current;
                    if (!dragId || !activeAlbumId) return;
                    const reordered = reorderItems(albumImages, dragId, image.id);
                    const otherImages = gallery.images.filter((item) => item.albumId !== activeAlbumId);
                    updateImages([...otherImages, ...reordered]);
                    dragIdRef.current = null;
                  }}
                  className={cn(
                    'rounded-xl border bg-[#faf9f6] p-3 transition-colors',
                    selectedIds.has(image.id) ? 'border-[#c5a67c]' : 'border-[#e8dfd6]',
                  )}
                >
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(image.id)}
                        onChange={() => toggleSelect(image.id)}
                        className="accent-[#c5a67c]"
                        aria-label="Select photo"
                      />
                      <GripVertical className="h-4 w-4 cursor-grab text-[#9e8e82]" />
                    </div>
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="h-20 w-20 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Field label="Caption">
                        <Input
                          value={image.caption}
                          onChange={(e) => updateImage(image.id, { caption: e.target.value })}
                          placeholder="Optional caption"
                        />
                      </Field>
                      <Field label="Alt text">
                        <Input
                          value={image.alt}
                          onChange={(e) => updateImage(image.id, { alt: e.target.value })}
                          placeholder="Describe this photo"
                        />
                      </Field>
                      <SelectField
                        label="Album"
                        value={image.albumId}
                        onChange={(value) => moveImageToAlbum(image.id, value)}
                        options={gallery.albums.map((album) => ({
                          label: albumTypeLabel(album),
                          value: album.id,
                        }))}
                      />
                      <div className="flex flex-wrap gap-3">
                        <ToggleRow
                          label="Featured"
                          checked={image.isFeatured}
                          onChange={(checked) => updateImage(image.id, { isFeatured: checked })}
                        />
                        <ToggleRow
                          label="Cover photo"
                          checked={image.isCover}
                          onChange={(checked) => updateImage(image.id, { isCover: checked })}
                        />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => {
                            setReplacePhotoId(image.id);
                            photoInputRef.current?.click();
                          }}
                          className="font-body text-xs text-[#c5a67c] hover:underline disabled:opacity-50"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateImages([...gallery.images, duplicateGalleryImage(image)]);
                            setLocalToast({ message: 'Photo duplicated.', type: 'success' });
                          }}
                          className="inline-flex items-center gap-1 font-body text-xs text-[#6d625a] hover:underline"
                        >
                          <Copy className="h-3 w-3" />
                          Duplicate
                        </button>
                        <button
                          type="button"
                          onClick={() => updateImages(gallery.images.filter((item) => item.id !== image.id))}
                          className="font-body text-xs text-[#c45c5c] hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Collapsible>

      <Collapsible title="Section Content" defaultOpen={false}>
        <Field label="Gallery Title">
          <Input
            value={gallery.sectionTitle}
            onChange={(e) => updateContent({ sectionTitle: e.target.value })}
            placeholder="Our Gallery"
          />
        </Field>
        <Field label="Subtitle">
          <Input
            value={gallery.subtitle}
            onChange={(e) => updateContent({ subtitle: e.target.value })}
            placeholder="Captured moments"
          />
        </Field>
        <Field label="Description">
          <textarea
            value={gallery.description}
            onChange={(e) => updateContent({ description: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-[#e8dfd6] bg-white px-3 py-2 font-body text-sm text-[#4e342e] outline-none focus:border-[#c5a67c]"
            placeholder="A collection of our favorite memories"
          />
        </Field>
        <Field label="Intro Message">
          <textarea
            value={gallery.introMessage}
            onChange={(e) => updateContent({ introMessage: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-[#e8dfd6] bg-white px-3 py-2 font-body text-sm italic text-[#4e342e] outline-none focus:border-[#c5a67c]"
            placeholder="Every picture tells our story..."
          />
        </Field>
        <Field label="Background Color">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={gallery.backgroundColor}
              onChange={(e) => updateContent({ backgroundColor: e.target.value })}
              className="h-10 w-12 cursor-pointer rounded border border-[#e8dfd6] bg-white"
            />
            <Input
              value={gallery.backgroundColor}
              onChange={(e) => updateContent({ backgroundColor: e.target.value })}
            />
          </div>
        </Field>
        <div className="overflow-hidden rounded-xl border border-[#e8dfd6]">
          {gallery.backgroundImageUrl ? (
            <img src={gallery.backgroundImageUrl} alt="" className="aspect-video w-full object-cover" />
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
              Upload background
            </button>
            {gallery.backgroundImageUrl && (
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
      </Collapsible>

      <Collapsible title="Albums" defaultOpen={false}>
        <div className="flex items-center justify-between">
          <p className="font-body text-xs text-[#9e8e82]">{gallery.albums.length} album(s)</p>
          <button
            type="button"
            onClick={() => {
              const album = createGalleryAlbum();
              updateContent({
                albums: [...gallery.albums, album],
                selectedAlbumId: album.id,
              });
            }}
            className="inline-flex items-center gap-1 font-body text-xs font-semibold text-[#c5a67c] hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Create album
          </button>
        </div>

        <div className="space-y-2">
          {gallery.albums.map((album) => (
            <div
              key={album.id}
              draggable
              onDragStart={() => {
                albumDragIdRef.current = album.id;
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                const dragId = albumDragIdRef.current;
                if (!dragId) return;
                reorderAlbums(dragId, album.id);
                albumDragIdRef.current = null;
              }}
              className={cn(
                'rounded-xl border p-3 transition-colors',
                activeAlbumId === album.id
                  ? 'border-[#c5a67c] bg-white'
                  : 'border-[#e8dfd6] bg-white/60',
              )}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-[#9e8e82]" />
                <button
                  type="button"
                  onClick={() => updateContent({ selectedAlbumId: album.id })}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate font-body text-sm font-medium text-[#4e342e]">
                    {albumTypeLabel(album)}
                  </p>
                  <p className="font-body text-[10px] text-[#9e8e82]">
                    {getImagesForAlbum(gallery.images, album.id).length} photos
                  </p>
                </button>
              </div>

              {activeAlbumId === album.id && (
                <div className="mt-3 space-y-3 border-t border-[#e8dfd6] pt-3">
                  {getImagesForAlbum(gallery.images, album.id).length === 0 && (
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => {
                        updateContent({ selectedAlbumId: album.id });
                        openPhotoPicker();
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#c5a67c]/60 bg-[#faf7f2] px-3 py-3 font-body text-xs font-semibold text-[#4e342e] transition-colors hover:border-[#c5a67c] hover:bg-white disabled:opacity-50"
                    >
                      <ImagePlus className="h-4 w-4 text-[#c5a67c]" />
                      Upload photos to this album
                    </button>
                  )}
                  <SelectField
                    label="Album Type"
                    value={album.albumType}
                    onChange={(value) =>
                      updateContent({
                        albums: gallery.albums.map((item) =>
                          item.id === album.id
                            ? {
                                ...item,
                                albumType: value as typeof album.albumType,
                                name:
                                  value === 'custom'
                                    ? item.name
                                    : ALBUM_TYPE_OPTIONS.find((option) => option.value === value)?.label ??
                                      item.name,
                              }
                            : item,
                        ),
                      })
                    }
                    options={ALBUM_TYPE_OPTIONS}
                  />
                  {album.albumType === 'custom' && (
                    <Field label="Album Name">
                      <Input
                        value={album.name}
                        onChange={(e) =>
                          updateContent({
                            albums: gallery.albums.map((item) =>
                              item.id === album.id ? { ...item, name: e.target.value } : item,
                            ),
                          })
                        }
                      />
                    </Field>
                  )}
                  <Field label="Album Description">
                    <textarea
                      value={album.description}
                      onChange={(e) =>
                        updateContent({
                          albums: gallery.albums.map((item) =>
                            item.id === album.id ? { ...item, description: e.target.value } : item,
                          ),
                        })
                      }
                      rows={2}
                      className="w-full rounded-lg border border-[#e8dfd6] bg-white px-3 py-2 font-body text-sm text-[#4e342e] outline-none focus:border-[#c5a67c]"
                      placeholder="Describe this album"
                    />
                  </Field>
                  <div className="overflow-hidden rounded-lg border border-[#e8dfd6]">
                    {album.coverImageUrl ? (
                      <img src={album.coverImageUrl} alt="" className="aspect-video w-full object-cover" />
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-[#faf7f2]">
                        <Images className="h-6 w-6 text-[#c5a67c]/50" />
                      </div>
                    )}
                    <div className="flex gap-3 border-t border-[#e8dfd6] px-2 py-1.5">
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => {
                          setAlbumCoverTargetId(album.id);
                          albumCoverInputRef.current?.click();
                        }}
                        className="font-body text-xs text-[#c5a67c] hover:underline disabled:opacity-50"
                      >
                        Set cover
                      </button>
                      {album.coverImageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            updateContent({
                              albums: gallery.albums.map((item) =>
                                item.id === album.id ? { ...item, coverImageUrl: null } : item,
                              ),
                            })
                          }
                          className="font-body text-xs text-[#c45c5c] hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  {gallery.albums.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteAlbum(album.id)}
                      className="font-body text-xs text-[#c45c5c] hover:underline"
                    >
                      Delete album
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <input
          ref={albumCoverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && albumCoverTargetId) {
              void onUpload(file, { type: 'album-cover', albumId: albumCoverTargetId });
            }
            e.target.value = '';
            setAlbumCoverTargetId(null);
          }}
        />
      </Collapsible>

      <Collapsible title="Layout & Slideshow">
        <SelectField
          label="Gallery Layout"
          value={gallery.layout}
          onChange={(value) => updateContent({ layout: value as GalleryDetailsContent['layout'] })}
          options={GALLERY_LAYOUT_OPTIONS}
        />
        <SliderField
          label="Columns"
          value={gallery.columns}
          min={1}
          max={4}
          onChange={(value) => updateContent({ columns: value })}
        />
        <SliderField
          label="Image Spacing"
          value={gallery.imageSpacing}
          min={4}
          max={24}
          suffix="px"
          onChange={(value) => updateContent({ imageSpacing: value })}
        />

        <div className="border-t border-[#e8dfd6] pt-4">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-[#9e8e82]">
            Slideshow
          </p>
          <div className="mt-3 space-y-1">
            <ToggleRow
              label="Auto Play"
              checked={gallery.slideshow.enabled}
              onChange={(checked) =>
                updateContent({ slideshow: { ...gallery.slideshow, enabled: checked } })
              }
            />
            <SliderField
              label="Slide Duration"
              value={gallery.slideshow.slideDuration}
              min={2}
              max={12}
              suffix="s"
              onChange={(value) =>
                updateContent({ slideshow: { ...gallery.slideshow, slideDuration: value } })
              }
            />
            <SliderField
              label="Transition Speed"
              value={gallery.slideshow.transitionSpeed}
              min={200}
              max={1200}
              suffix="ms"
              onChange={(value) =>
                updateContent({ slideshow: { ...gallery.slideshow, transitionSpeed: value } })
              }
            />
            <ToggleRow
              label="Loop"
              checked={gallery.slideshow.loop}
              onChange={(checked) =>
                updateContent({ slideshow: { ...gallery.slideshow, loop: checked } })
              }
            />
            <ToggleRow
              label="Pause on Hover"
              checked={gallery.slideshow.pauseOnHover}
              onChange={(checked) =>
                updateContent({ slideshow: { ...gallery.slideshow, pauseOnHover: checked } })
              }
            />
          </div>
        </div>
      </Collapsible>

      <Collapsible title="Featured Photos" defaultOpen={false}>
        <SelectField
          label="Featured Display"
          value={gallery.featuredDisplayMode}
          onChange={(value) =>
            updateContent({
              featuredDisplayMode: value as GalleryDetailsContent['featuredDisplayMode'],
            })
          }
          options={[
            { label: 'Hero Carousel', value: 'hero-carousel' },
            { label: 'Featured Grid', value: 'featured-grid' },
            { label: 'Highlight Section', value: 'highlight-section' },
          ]}
        />
        <p className="font-body text-xs text-[#9e8e82]">
          Mark photos as &ldquo;Featured&rdquo; in the Photos panel to include them here.
        </p>
      </Collapsible>

      <Collapsible title="Design Settings" defaultOpen={false}>
        <SliderField
          label="Overlay Opacity"
          value={Math.round(gallery.overlayOpacity * 100)}
          min={0}
          max={100}
          suffix="%"
          onChange={(value) => updateContent({ overlayOpacity: value / 100 })}
        />
        <SliderField
          label="Section Padding"
          value={gallery.sectionPadding}
          min={16}
          max={64}
          suffix="px"
          onChange={(value) => updateContent({ sectionPadding: value })}
        />
        <SelectField
          label="Gallery Width"
          value={gallery.galleryWidth}
          onChange={(value) =>
            updateContent({ galleryWidth: value as GalleryDetailsContent['galleryWidth'] })
          }
          options={[
            { label: 'Narrow', value: 'narrow' },
            { label: 'Default', value: 'default' },
            { label: 'Full Width', value: 'full' },
          ]}
        />
        <SliderField
          label="Image Border Radius"
          value={gallery.imageBorderRadius}
          min={0}
          max={24}
          suffix="px"
          onChange={(value) => updateContent({ imageBorderRadius: value })}
        />
        <SelectField
          label="Shadow Style"
          value={gallery.shadowStyle}
          onChange={(value) =>
            updateContent({ shadowStyle: value as GalleryDetailsContent['shadowStyle'] })
          }
          options={[
            { label: 'None', value: 'none' },
            { label: 'Soft', value: 'soft' },
            { label: 'Medium', value: 'medium' },
            { label: 'Strong', value: 'strong' },
          ]}
        />
        <SelectField
          label="Caption Position"
          value={gallery.captionPosition}
          onChange={(value) =>
            updateContent({ captionPosition: value as GalleryDetailsContent['captionPosition'] })
          }
          options={[
            { label: 'Below Image', value: 'below' },
            { label: 'Overlay', value: 'overlay' },
            { label: 'Hidden', value: 'hidden' },
          ]}
        />
        <SelectField
          label="Hover Effect"
          value={gallery.hoverAnimation}
          onChange={(value) =>
            updateContent({ hoverAnimation: value as GalleryDetailsContent['hoverAnimation'] })
          }
          options={[
            { label: 'None', value: 'none' },
            { label: 'Zoom', value: 'zoom' },
            { label: 'Lift', value: 'lift' },
            { label: 'Fade', value: 'fade' },
            { label: 'Glow', value: 'glow' },
            { label: 'Blur Background', value: 'blur' },
          ]}
        />
        <SelectField
          label="Font Family"
          value={gallery.fontFamily}
          onChange={(value) => updateContent({ fontFamily: value })}
          options={GALLERY_FONT_OPTIONS}
        />
        <SliderField
          label="Heading Size"
          value={gallery.headingFontSize}
          min={18}
          max={36}
          suffix="px"
          onChange={(value) => updateContent({ headingFontSize: value })}
        />
        <SliderField
          label="Caption Size"
          value={gallery.captionFontSize}
          min={9}
          max={16}
          suffix="px"
          onChange={(value) => updateContent({ captionFontSize: value })}
        />
        <Field label="Text Color">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={gallery.textColor}
              onChange={(e) => updateContent({ textColor: e.target.value })}
              className="h-10 w-12 cursor-pointer rounded border border-[#e8dfd6] bg-white"
            />
            <Input
              value={gallery.textColor}
              onChange={(e) => updateContent({ textColor: e.target.value })}
            />
          </div>
        </Field>
        <Field label="Accent Color">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={gallery.accentColor}
              onChange={(e) => updateContent({ accentColor: e.target.value })}
              className="h-10 w-12 cursor-pointer rounded border border-[#e8dfd6] bg-white"
            />
            <Input
              value={gallery.accentColor}
              onChange={(e) => updateContent({ accentColor: e.target.value })}
            />
          </div>
        </Field>
        <SliderField
          label="Max Images"
          value={gallery.maxImages}
          min={10}
          max={500}
          onChange={(value) => updateContent({ maxImages: value })}
        />
      </Collapsible>

      <Collapsible title="Animation" defaultOpen={false}>
        <SelectField
          label="Entrance Animation"
          value={gallery.animation}
          onChange={(value) =>
            updateContent({ animation: value as GalleryDetailsContent['animation'] })
          }
          options={[
            { label: 'None', value: 'none' },
            { label: 'Fade In', value: 'fade-in' },
            { label: 'Slide Up', value: 'slide-up' },
            { label: 'Scale', value: 'scale' },
            { label: 'Stagger', value: 'stagger' },
            { label: 'Gallery Reveal', value: 'reveal' },
          ]}
        />
      </Collapsible>
    </div>
  );
}
