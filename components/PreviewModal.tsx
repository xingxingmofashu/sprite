import { useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Minimize2 } from 'lucide-react';
import type { EmojiInfo } from '@/types';

interface PreviewModalProps {
  emoji: EmojiInfo | null;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

export function PreviewModal({
  emoji,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
}: PreviewModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    },
    [onPrev, onNext, hasPrev, hasNext],
  );

  useEffect(() => {
    if (emoji) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [emoji, handleKeyDown]);

  if (!emoji) return null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-[92vw] max-h-[92vh] min-w-80 w-auto h-auto p-0 gap-4 bg-transparent border-0 shadow-none"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{emoji.alt || 'Preview'}</DialogTitle>

        {/* Close button — top right */}
        <DialogClose
          render={
            <Button variant="ghost" size="icon" className="absolute top-3 right-3 z-10 rounded-full bg-white/20 hover:bg-white/35 text-white">
              <Minimize2 className="size-5" />
            </Button>
          }
        />

        {/* Image */}
        <img
          src={emoji.src}
          className="max-w-full max-h-[calc(92vh-6rem)] object-contain rounded-lg select-none"
          draggable={false}
        />

        {/* Footer with prev/next */}
        <DialogFooter className="mx-0 mb-0 gap-0 pb-4 bg-transparent border-0 rounded-none sm:justify-center">
          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" size="icon" disabled={!hasPrev} onClick={onPrev} className="rounded-full bg-white/20 hover:bg-white/35 text-white">
              <ChevronLeft className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" disabled={!hasNext} onClick={onNext} className="rounded-full bg-white/20 hover:bg-white/35 text-white">
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
