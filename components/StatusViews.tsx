import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface LoadingViewProps {
  onRetry: () => void;
}

interface ErrorViewProps {
  message: string;
  onRetry: () => void;
}

interface EmptyViewProps {
  onRetry: () => void;
}

/** Loading state — spinning indicator */
export function LoadingView({ onRetry: _onRetry }: LoadingViewProps) {
  const { t } = useI18n();

  return (
    <div className="w-[440px] min-h-[300px] flex flex-col items-center justify-center gap-3 bg-background select-none">
      <Spinner className="size-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{t('scanning')}</p>
    </div>
  );
}

/** Error state — message + retry button */
export function ErrorView({ message, onRetry }: ErrorViewProps) {
  const { t } = useI18n();

  return (
    <div className="w-[440px] min-h-[300px] flex flex-col bg-background select-none">
      <SidePanelHeader total={0} emojiCount={0} stickerCount={0} />
      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-5 py-8 text-center">
        <p className="text-4xl m-0">⚠️</p>
        <p className="text-sm text-destructive whitespace-pre-line leading-relaxed max-w-[360px]">{message}</p>
        <Button variant="secondary" onClick={onRetry} className="mt-2">
          {t('retry')}
        </Button>
      </div>
    </div>
  );
}

/** Empty state — no emojis found */
export function EmptyView({ onRetry }: EmptyViewProps) {
  const { t } = useI18n();

  return (
    <div className="w-[440px] min-h-[300px] flex flex-col bg-background select-none">
      <SidePanelHeader total={0} emojiCount={0} stickerCount={0} />
      <div className="flex-1 flex flex-col items-center justify-center gap-1 px-5 py-8 text-center">
        <p className="text-4xl m-0">😅</p>
        <p className="text-sm text-muted-foreground">{t('noEmojisFound')}</p>
        <p className="text-xs text-muted-foreground/50 max-w-[300px]">{t('noEmojisHint')}</p>
        <Button variant="secondary" onClick={onRetry} className="mt-3">
          {t('retry')}
        </Button>
      </div>
    </div>
  );
}
