import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/utils/cn';
import type { EmojiInfo } from '@/utils/types';

interface EmojiCardProps {
  emoji: EmojiInfo;
  selected: boolean;
  proxiedUrl?: string;
  onToggle: (id: string) => void;
  onDownload: (emoji: EmojiInfo) => void;
}

export function EmojiCard({ emoji, selected, proxiedUrl, onToggle, onDownload }: EmojiCardProps) {
  const { t } = useI18n();

  return (
    <div
      onClick={() => onToggle(emoji.id)}
      className={cn(
        'group relative flex items-center justify-center aspect-square rounded-xl border-2 overflow-hidden cursor-pointer transition-colors',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-transparent bg-muted hover:border-primary/50 hover:bg-primary/5',
      )}
    >
      {/* Checkbox */}
      <div className="absolute top-1 left-1 z-10">
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggle(emoji.id)}
          className="size-3.5"
        />
      </div>

      {/* Image */}
      <img
        src={proxiedUrl || emoji.src}
        alt={emoji.alt}
        loading="lazy"
        className={cn(
          'block pointer-events-none object-contain',
          emoji.type === 'sticker' ? 'max-w-[90%] max-h-[90%]' : 'max-w-[80%] max-h-[80%]',
        )}
      />

      {/* Download button overlay — hidden until card hover */}
      <button
        title={t('downloadTooltip')}
        onClick={(e) => {
          e.stopPropagation();
          onDownload(emoji);
        }}
        className="absolute bottom-1 right-1 size-6 flex items-center justify-center rounded bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      >
        <span className="text-white text-xs leading-none">⬇</span>
      </button>
    </div>
  );
}
