import { useState, useCallback } from 'react';
import { useEmojiScanner } from '@/utils/useEmojiScanner';

function App() {
  const { t } = useI18n();
  const {
    emojis,
    selectedIds,
    status,
    errorMsg,
    proxiedUrls,
    handleScan,
    toggleSelect,
    toggleSelectAll,
    downloadSingle,
  } = useEmojiScanner();

  // Local ZIP download loading state (doesn't affect card re-renders)
  const [zipping, setZipping] = useState(false);

  const downloadSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setZipping(true);
    try {
      const selected = emojis.filter((e) => selectedIds.has(e.id));
      await browser.runtime.sendMessage({ type: 'DOWNLOAD_ZIP', emojis: selected });
    } catch (err) {
      console.error('Batch download failed:', err);
    }
    setZipping(false);
  }, [emojis, selectedIds]);

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
        downloading={zipping}
        onSelectAll={toggleSelectAll}
        onRescan={handleScan}
        onDownloadZip={downloadSelected}
      />

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5">
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
