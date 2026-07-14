import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
        'emoji-card relative flex items-center justify-center aspect-square rounded-xl border-2 overflow-hidden cursor-pointer transition-colors',
        selected
          ? 'border-[#fe2c55] bg-[#fef0f3]'
          : 'border-transparent bg-muted hover:border-[#fe2c55] hover:bg-[#fef0f3]',
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

      {/* Download button overlay */}
      <button
        title={t('downloadTooltip')}
        onClick={(e) => {
          e.stopPropagation();
          onDownload(emoji);
        }}
        className="download-btn-overlay cursor-pointer"
      >
        <span className="text-white text-xs leading-none">⬇</span>
      </button>

      {/* Type badge */}
      <Badge variant="secondary" className="emoji-badge text-[10px] px-1.5 py-0.5 leading-tight font-medium">
        {emoji.type === 'sticker' ? t('badgeSticker') : t('badgeEmoji')}
      </Badge>
    </div>
  );
}
