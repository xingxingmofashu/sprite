import { cn } from '@/lib/utils';
import {
  Attachment,
  AttachmentMedia,
  AttachmentActions,
  AttachmentAction,
} from '@/components/ui/attachment';
import { Maximize2, Download, Play } from 'lucide-react';
import type { VideoInfo } from '@/types';

interface VideoCardProps {
  video: VideoInfo;
  selected: boolean;
  onToggle: (id: string) => void;
  onDownload: (video: VideoInfo) => void;
  onPreview: (video: VideoInfo) => void;
}

export function VideoCard({ video, selected, onToggle, onDownload, onPreview }: VideoCardProps) {
  const { t } = useI18n();

  return (
    <Attachment
      onClick={() => onToggle(video.id)}
      orientation="vertical"
      className={cn(
        'cursor-pointer transition-all bg-transparent shadow-none border-border w-full gap-0',
        selected
          ? 'border-primary'
          : 'hover:border-primary/30',
      )}
    >
      <AttachmentMedia variant="image" className="relative w-full">
        <img src={video.poster} loading="lazy" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white/90 pointer-events-none">
          <Play className="size-6" />
        </span>
      </AttachmentMedia>
      <AttachmentActions className="static! flex justify-between p-1">
        <AttachmentAction
          aria-label={t('previewTooltip')}
          onClick={(e) => { e.stopPropagation(); onPreview(video); }}
        >
          <Maximize2 />
        </AttachmentAction>
        <AttachmentAction
          aria-label={t('downloadTooltip')}
          onClick={(e) => { e.stopPropagation(); onDownload(video); }}
        >
          <Download />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  );
}