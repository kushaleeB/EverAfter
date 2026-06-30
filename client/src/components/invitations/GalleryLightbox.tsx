import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Maximize, Minimize, X, ZoomIn, ZoomOut } from 'lucide-react';
import type { GalleryImage } from '@/lib/gallerySection';
import { cn } from '@/lib/utils';

interface GalleryLightboxProps {
  images: GalleryImage[];
  initialIndex: number;
  albumName?: string;
  allowDownload?: boolean;
  onClose: () => void;
}

const ZOOM_LEVELS = [1, 1.25, 1.5, 2, 2.5];

export function GalleryLightbox({
  images,
  initialIndex,
  albumName,
  allowDownload = true,
  onClose,
}: GalleryLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const current = images[index];
  const zoom = ZOOM_LEVELS[zoomIndex] ?? 1;

  const goNext = useCallback(() => {
    setZoomIndex(0);
    setIndex((value) => (value + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setZoomIndex(0);
    setIndex((value) => (value - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') goNext();
      if (event.key === 'ArrowLeft') goPrev();
      if (event.key === '+' || event.key === '=') setZoomIndex((value) => Math.min(value + 1, ZOOM_LEVELS.length - 1));
      if (event.key === '-') setZoomIndex((value) => Math.max(value - 1, 0));
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goNext, goPrev, onClose]);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  async function toggleFullscreen() {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await containerRef.current.requestFullscreen();
    }
  }

  function handleDownload() {
    if (!current) return;
    const link = document.createElement('a');
    link.href = current.url;
    link.download = current.caption || `photo-${index + 1}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  }

  if (!current) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col bg-[#1f1b18]/96 backdrop-blur-md"
      role="dialog"
      aria-modal
      aria-label="Image viewer"
      onTouchStart={(e) => {
        touchStartX.current = e.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchStartX.current;
        const end = e.changedTouches[0]?.clientX;
        if (start === null || end === undefined) return;
        const delta = end - start;
        if (Math.abs(delta) > 48) {
          if (delta < 0) goNext();
          else goPrev();
        }
        touchStartX.current = null;
      }}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="font-body text-sm text-white/90">
            {index + 1} / {images.length} Photos
          </p>
          {albumName && <p className="mt-0.5 font-body text-xs text-white/50">{albumName}</p>}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoomIndex((value) => Math.max(value - 1, 0))}
            disabled={zoomIndex === 0}
            className="rounded-full p-2 text-white/80 hover:bg-white/10 disabled:opacity-40"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomIndex((value) => Math.min(value + 1, ZOOM_LEVELS.length - 1))}
            disabled={zoomIndex === ZOOM_LEVELS.length - 1}
            className="rounded-full p-2 text-white/80 hover:bg-white/10 disabled:opacity-40"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          {allowDownload && (
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-full p-2 text-white/80 hover:bg-white/10"
              aria-label="Download image"
            >
              <Download className="h-5 w-5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            className="rounded-full p-2 text-white/80 hover:bg-white/10"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-white/80 hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-2 z-10 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <img
          src={current.url}
          alt={current.alt || current.caption || 'Gallery photo'}
          className={cn(
            'max-h-[72vh] max-w-full object-contain transition-transform duration-300 ease-out',
            zoom > 1 && 'cursor-zoom-out',
          )}
          style={{ transform: `scale(${zoom})` }}
          onClick={() => setZoomIndex((value) => (value > 0 ? 0 : Math.min(value + 1, ZOOM_LEVELS.length - 1)))}
        />

        <button
          type="button"
          onClick={goNext}
          className="absolute right-2 z-10 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {(current.caption || current.alt) && (
        <div className="border-t border-white/10 px-6 py-4 text-center">
          {current.caption && <p className="font-display text-lg text-white">{current.caption}</p>}
          {!current.caption && current.alt && (
            <p className="font-body text-sm text-white/70">{current.alt}</p>
          )}
        </div>
      )}
    </div>
  );
}
