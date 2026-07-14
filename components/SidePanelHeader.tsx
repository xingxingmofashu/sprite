interface SidePanelHeaderProps {
  total: number;
  emojiCount: number;
  stickerCount: number;
}

/** Header bar with title and stats */
export function SidePanelHeader({ total, emojiCount, stickerCount }: SidePanelHeaderProps) {
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
    </div>
  );
}
