interface PopupHeaderProps {
  total: number;
  emojiCount: number;
  stickerCount: number;
}

/** Header bar with title and stats */
export function PopupHeader({ total, emojiCount, stickerCount }: PopupHeaderProps) {
  const { t } = useI18n();

  return (
    <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b border-border">
      <h1 className="text-base font-bold text-foreground">😊 {t('extName')}</h1>
      {total > 0 && (
        <p className="mt-0.5 text-xs text-muted-foreground/70">
          {t('totalEmojis', [String(total), String(emojiCount), String(stickerCount)])}
        </p>
      )}
    </div>
  );
}
