import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { ImageOff } from 'lucide-react';

interface EmptyViewProps {
  onRetry: () => void;
}

/** Loading state — spinning indicator */
export function LoadingView() {
  const { t } = useI18n();

  return (
    <div className="w-full h-dvh flex flex-col items-center justify-center gap-3 bg-background select-none">
      <Spinner className="size-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{t('scanning')}</p>
    </div>
  );
}

/** Empty state — no emojis found */
export function EmptyView({ onRetry }: EmptyViewProps) {
  const { t } = useI18n();

  return (
    <div className="w-full h-dvh flex flex-col bg-background select-none">
      <SidePanelHeader total={0} />
      <Empty className="flex-1">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ImageOff className="size-5" />
          </EmptyMedia>
          <EmptyTitle>{t('noEmojisFound')}</EmptyTitle>
          <EmptyDescription>{t('noEmojisHint')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="secondary" onClick={onRetry}>
            {t('retry')}
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
