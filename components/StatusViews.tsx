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
    <div className="w-[440px] min-h-[300px] flex flex-col items-center justify-center gap-3 bg-white select-none">
      <div className="spinner" />
      <p className="text-sm text-gray-500">{t('scanning')}</p>
    </div>
  );
}

/** Error state — message + retry button */
export function ErrorView({ message, onRetry }: ErrorViewProps) {
  const { t } = useI18n();

  return (
    <div className="w-[440px] min-h-[300px] flex flex-col bg-white select-none">
      <PopupHeader total={0} emojiCount={0} stickerCount={0} />
      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-5 py-8 text-center">
        <p className="text-4xl m-0">⚠️</p>
        <p className="text-sm text-red-500 whitespace-pre-line leading-relaxed max-w-[360px]">{message}</p>
        <button
          onClick={onRetry}
          className="mt-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-[0.97] transition-all cursor-pointer"
        >
          {t('retry')}
        </button>
      </div>
    </div>
  );
}

/** Empty state — no emojis found */
export function EmptyView({ onRetry }: EmptyViewProps) {
  const { t } = useI18n();

  return (
    <div className="w-[440px] min-h-[300px] flex flex-col bg-white select-none">
      <PopupHeader total={0} emojiCount={0} stickerCount={0} />
      <div className="flex-1 flex flex-col items-center justify-center gap-1 px-5 py-8 text-center">
        <p className="text-4xl m-0">😅</p>
        <p className="text-sm text-gray-500">{t('noEmojisFound')}</p>
        <p className="text-xs text-gray-300 max-w-[300px]">{t('noEmojisHint')}</p>
        <button
          onClick={onRetry}
          className="mt-3 px-4 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-[0.97] transition-all cursor-pointer"
        >
          {t('retry')}
        </button>
      </div>
    </div>
  );
}
