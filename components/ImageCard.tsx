import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
        <Button
          variant="ghost"
          size="icon-sm"
          title={t('previewTooltip')}
          onClick={(e) => {
            e.stopPropagation();
            onPreview(emoji);
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          <Maximize2 />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          title={t('downloadTooltip')}
          onClick={(e) => {
            e.stopPropagation();
            onDownload(emoji);
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          <Download />
        </Button>
      </CardFooter>
    </Card>
  );
}
