interface PopupHeaderProps {
  total: number;
  emojiCount: number;
  stickerCount: number;
}

/** 顶部标题栏 + 统计 */
export function PopupHeader({ total, emojiCount, stickerCount }: PopupHeaderProps) {
  const { t } = useI18n();

  return (
    <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b border-gray-100">
      <h1 className="text-base font-bold text-gray-900">😊 {t('extName')}</h1>
      {total > 0 && (
        <p className="mt-0.5 text-xs text-gray-400">
          {t('totalEmojis', [String(total), String(emojiCount), String(stickerCount)])}
        </p>
      )}
    </div>
  );
}
