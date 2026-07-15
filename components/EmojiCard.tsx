import { cn } from '@/utils/cn';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Maximize2, Download } from 'lucide-react';
import type { EmojiInfo } from '@/types';

interface EmojiCardProps {
  emoji: EmojiInfo;
  selected: boolean;
  onToggle: (id: string) => void;
  onDownload: (emoji: EmojiInfo) => void;
  onPreview: (emoji: EmojiInfo) => void;
}

export function EmojiCard({ emoji, selected, onToggle, onDownload, onPreview }: EmojiCardProps) {
  const { t } = useI18n();

  return (
    <Card
      onClick={() => onToggle(emoji.id)}
      className={cn(
        'group cursor-pointer overflow-hidden transition-all bg-transparent shadow-none border-border',
        selected
          ? 'border-primary'
          : 'hover:border-primary/30',
      )}
    >
      <CardContent className="p-0 flex items-center justify-center aspect-square">
        <img
          src={emoji.src}
          loading="lazy"
          className="w-full h-full object-contain"
        />
      </CardContent>
      <CardFooter className="p-1.5 pt-0 flex items-center justify-between">
        <button
          title={t('previewTooltip')}
          onClick={(e) => {
            e.stopPropagation();
            onPreview(emoji);
          }}
          className="size-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Maximize2 className="size-3.5" />
        </button>
        <button
          title={t('downloadTooltip')}
          onClick={(e) => {
            e.stopPropagation();
            onDownload(emoji);
          }}
          className="size-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Download className="size-3.5" />
        </button>
      </CardFooter>
    </Card>
  );
}
