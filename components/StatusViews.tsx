import { Spinner } from '@/components/ui/spinner';

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