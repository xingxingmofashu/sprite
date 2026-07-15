import { cn } from '@/lib/utils';
import {
  Attachment,
  AttachmentMedia,
  AttachmentActions,
  AttachmentAction,
} from '@/components/ui/attachment';
import { Maximize2, Download } from 'lucide-react';
import type { EmojiInfo } from '@/types';

interface ImageCardProps {
  emoji: EmojiInfo;
  selected: boolean;
  onToggle: (id: string) => void;
  onDownload: (emoji: EmojiInfo) => void;
  onPreview: (emoji: EmojiInfo) => void;
}

export function ImageCard({ emoji, selected, onToggle, onDownload, onPreview }: ImageCardProps) {
  const { t } = useI18n();

  return (
    <Attachment
      onClick={() => onToggle(emoji.id)}
      orientation="vertical"
      className={cn(
        'cursor-pointer transition-all bg-transparent shadow-none border-border w-full gap-0',
        selected
          ? 'border-primary'
          : 'hover:border-primary/30',
      )}
    >
      <AttachmentMedia variant="image" className="w-full">
        <img src={emoji.src} loading="lazy" />
      </AttachmentMedia>
      <AttachmentActions className="!static flex justify-between p-1">
        <AttachmentAction
          aria-label={t('previewTooltip')}
          onClick={(e) => { e.stopPropagation(); onPreview(emoji); }}
        >
          <Maximize2 />
        </AttachmentAction>
        <AttachmentAction
          aria-label={t('downloadTooltip')}
          onClick={(e) => { e.stopPropagation(); onDownload(emoji); }}
        >
          <Download />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  );
}
