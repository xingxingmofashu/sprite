import { useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Minimize2 } from 'lucide-react';
import type { EmojiInfo } from '@/utils/types';

interface PreviewModalProps {
  emoji: EmojiInfo | null;
  proxiedUrl?: string;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

export function PreviewModal({
  emoji,
  proxiedUrl,
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
        className="max-w-[92vw] max-h-[92vh] w-auto h-auto p-0 gap-0 bg-transparent border-0 shadow-none [&>button:last-child]:hidden"
        onPointerDownOutside={onClose}
      >
        <DialogTitle className="sr-only">{emoji.alt || 'Preview'}</DialogTitle>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 size-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/35 text-white transition-colors"
        >
          <Minimize2 className="size-5" />
        </button>

        {/* Prev */}
        {hasPrev && (
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 size-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/35 text-white transition-colors"
          >
            <ChevronLeft className="size-6" />
          </button>
        )}

        {/* Image */}
        <img
          src={proxiedUrl || emoji.src}
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg select-none"
          draggable={false}
        />

        {/* Next */}
        {hasNext && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 size-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/35 text-white transition-colors"
          >
            <ChevronRight className="size-6" />
          </button>
        )}

        {/* Filename footer */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/50 text-xs max-w-[80vw] truncate">
          {emoji.alt || emoji.src.split('/').pop()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
