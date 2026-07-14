import { Button } from '@/components/ui/button';
import { Maximize2 } from 'lucide-react';

interface PopupHeaderProps {
  total: number;
  emojiCount: number;
  stickerCount: number;
  onFullscreen?: () => void;
}

/** Header bar with title, stats, and fullscreen button */
export function PopupHeader({ total, emojiCount, stickerCount, onFullscreen }: PopupHeaderProps) {
  const { t } = useI18n();

  return (
    <div className="flex-shrink-0 flex items-center justify-between px-4 pt-3 pb-2 border-b border-border">
      <div className="min-w-0">
        <h1 className="text-base font-bold text-foreground truncate">😊 {t('extName')}</h1>
        {total > 0 && (
          <p className="mt-0.5 text-xs text-muted-foreground/70">
            {t('totalEmojis', [String(total), String(emojiCount), String(stickerCount)])}
          </p>
        )}
      </div>
      {onFullscreen && (
        <Button variant="outline" size="sm" onClick={onFullscreen} title={t('fullscreen')} className="gap-1.5 shrink-0">
          <Maximize2 className="size-3.5" />
          <span className="text-xs">{t('fullscreen')}</span>
        </Button>
      )}
    </div>
  );
}
