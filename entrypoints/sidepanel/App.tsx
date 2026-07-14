import { useEmojiScanner } from '@/utils/useEmojiScanner';

function App() {
  const { t } = useI18n();
  const {
    emojis,
    selectedIds,
    status,
    errorMsg,
    downloading,
    proxiedUrls,
    handleScan,
    toggleSelect,
    toggleSelectAll,
    downloadSingle,
    downloadSelected,
  } = useEmojiScanner();

  if (status === 'scanning') {
    return <LoadingView onRetry={handleScan} />;
  }

  if (status === 'error') {
    return <ErrorView message={errorMsg} onRetry={handleScan} />;
  }

  if (emojis.length === 0) {
    return <EmptyView onRetry={handleScan} />;
  }

  const stickerCount = emojis.filter((e) => e.type === 'sticker').length;
  const emojiCount = emojis.filter((e) => e.type === 'emoji').length;

  return (
    <div className="w-full h-dvh flex flex-col bg-background select-none">
      <SidePanelHeader total={emojis.length} emojiCount={emojiCount} stickerCount={stickerCount} />
      <SidePanelToolbar
        total={emojis.length}
        selectedCount={selectedIds.size}
        allSelected={selectedIds.size === emojis.length}
        downloading={downloading}
        onSelectAll={toggleSelectAll}
        onRescan={handleScan}
        onDownloadZip={downloadSelected}
      />

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2.5">
          {emojis.map((emoji) => (
            <EmojiCard
              key={emoji.id}
              emoji={emoji}
              selected={selectedIds.has(emoji.id)}
              proxiedUrl={proxiedUrls[emoji.src]}
              onToggle={toggleSelect}
              onDownload={downloadSingle}
            />
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 px-4 py-2 border-t border-border text-center">
        <p className="text-[11px] text-muted-foreground/50">{t('rightClickHint')}</p>
      </div>
    </div>
  );
}

export default App;
