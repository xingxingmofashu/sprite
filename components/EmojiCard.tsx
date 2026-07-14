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
      className={`emoji-card relative flex items-center justify-center aspect-square rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${
        selected
          ? 'border-[#fe2c55] bg-[#fef0f3]'
          : 'border-transparent bg-gray-50 hover:border-[#fe2c55] hover:bg-[#fef0f3]'
      }`}
    >
      {/* Checkbox */}
      <div className="absolute top-1 left-1 z-10">
        <input
          type="checkbox"
          className="accent-[#fe2c55] w-3.5 h-3.5 cursor-pointer"
          checked={selected}
          onChange={() => onToggle(emoji.id)}
        />
      </div>

      {/* Image */}
      <img
        src={proxiedUrl || emoji.src}
        alt={emoji.alt}
        loading="lazy"
        className={`block pointer-events-none ${
          emoji.type === 'sticker' ? 'max-w-[90%] max-h-[90%]' : 'max-w-[80%] max-h-[80%]'
        } object-contain`}
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
      <span className="emoji-badge text-white">
        {emoji.type === 'sticker' ? t('badgeSticker') : t('badgeEmoji')}
      </span>
    </div>
  );
}
