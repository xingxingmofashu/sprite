import { useState, useCallback, useEffect } from 'react';
import { useImageScanner } from '@/utils/useImageScanner';
import { ImageCard } from '@/components/ImageCard';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  const { t } = useI18n();
  const {
    emojis,
    selectedIds,
    status,
    handleScan,
    toggleSelect,
    toggleSelectAll,
    downloadSingle,
  } = useImageScanner();

  // Local ZIP download loading state (doesn't affect card re-renders)
  const [zipping, setZipping] = useState(false);

  // Preview state
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const previewEmoji = previewIndex !== null ? emojis[previewIndex] ?? null : null;

  // Reset preview if emojis array shrinks below current index
  useEffect(() => {
    if (previewIndex !== null && previewIndex >= emojis.length) {
      setPreviewIndex(null);
    }
  }, [emojis.length, previewIndex]);

  const downloadSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setZipping(true);
    try {
      const selected = emojis.filter((e) => selectedIds.has(e.id));
      await browser.runtime.sendMessage({ type: 'DOWNLOAD_ZIP', emojis: selected });
    } catch (err) {
      console.error('Batch download failed:', err);
      alert(t('downloadError'));
    }
    setZipping(false);
  }, [emojis, selectedIds, t]);

  if (status === 'scanning') {
    return <LoadingView onRetry={handleScan} />;
  }

  if (emojis.length === 0) {
    return <EmptyView onRetry={handleScan} />;
  }

  return (
    <div className="w-full h-dvh flex flex-col bg-background select-none">
      <SidePanelHeader total={emojis.length} />
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
          {emojis.map((emoji, index) => (
            <ImageCard
              key={emoji.id}
              emoji={emoji}
              selected={selectedIds.has(emoji.id)}
              onToggle={toggleSelect}
              onDownload={downloadSingle}
              onPreview={() => setPreviewIndex(index)}
            />
          ))}
        </div>
      </div>

      <div className="shrink-0 px-4 py-2 border-t border-border text-center">
        <p className="text-[11px] text-muted-foreground/50">{t('rightClickHint')}</p>
      </div>

      {/* Image preview modal */}
      {previewEmoji && (
        <ErrorBoundary fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <p className="text-white text-sm">Preview unavailable</p>
          </div>
        }>
          <PreviewModal
            emoji={previewEmoji}
            index={previewIndex!}
            total={emojis.length}
            onPrev={() => setPreviewIndex((i) => i! - 1)}
            onNext={() => setPreviewIndex((i) => i! + 1)}
            onClose={() => setPreviewIndex(null)}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}

export default App;
