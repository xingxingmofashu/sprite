import { useEffect, useCallback, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Minimize2, ImageOff } from 'lucide-react';
import type { ImageInfo } from '@/types';

const OVERLAY_BUTTON = 'rounded-full bg-white/20 hover:bg-white/35 text-white';

interface PreviewModalProps {
  emoji: ImageInfo;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

export function PreviewModal({
  emoji,
  index,
  total,
  onPrev,
  onNext,
  onClose,
}: PreviewModalProps) {
  const hasPrev = index > 0;
  const hasNext = index < total - 1;

  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [emoji.src]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      try {
        if (e.key === 'ArrowLeft' && hasPrev) onPrev();
        if (e.key === 'ArrowRight' && hasNext) onNext();
      } catch (err) {
        console.error('Preview navigation failed:', err);
      }
    },
    [onPrev, onNext, hasPrev, hasNext],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const safeClose = useCallback(() => {
    try { onClose(); } catch (err) { console.error('Failed to close preview:', err); }
  }, [onClose]);

  return (
    <Dialog open onOpenChange={(open) => { if (!open) safeClose(); }}>
      <DialogContent
        className="max-w-[92vw] max-h-[92vh] min-w-80 w-auto h-auto p-0 gap-4 bg-transparent border-0 shadow-none"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{emoji.alt || 'Preview'}</DialogTitle>

        {/* Close button — top right */}
        <DialogClose
          render={
            <Button variant="ghost" size="icon" className={`absolute top-3 right-3 z-10 ${OVERLAY_BUTTON}`}>
              <Minimize2 className="size-5" />
            </Button>
          }
        />

        {/* Image */}
        {imgError ? (
          <div className="flex flex-col items-center justify-center gap-2 max-w-full min-h-[40vh] text-white/60">
            <ImageOff className="size-10" />
            <p className="text-sm">{emoji.alt || 'Failed to load image'}</p>
            <Button variant="ghost" size="sm" className={OVERLAY_BUTTON} onClick={() => setImgError(false)}>
              Retry
            </Button>
          </div>
        ) : (
          <img
            src={emoji.src}
            className="max-w-full max-h-[calc(92vh-6rem)] object-contain rounded-lg select-none"
            draggable={false}
            onError={() => { console.error('Image failed to load:', emoji.src); setImgError(true); }}
          />
        )}

        {/* Footer with filename + prev/next */}
        <DialogFooter className="mx-0 mb-0 gap-0 pb-4 bg-transparent border-0 rounded-none sm:justify-center">
          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" size="icon" disabled={!hasPrev} onClick={onPrev} className={OVERLAY_BUTTON}>
              <ChevronLeft className="size-5" />
            </Button>
            <span className="text-white/50 text-xs max-w-[60vw] truncate">
              {emoji.alt || emoji.src.split('/').pop()}
            </span>
            <Button variant="ghost" size="icon" disabled={!hasNext} onClick={onNext} className={OVERLAY_BUTTON}>
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
