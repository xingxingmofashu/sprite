import { useState, useCallback, useEffect, useMemo } from 'react';
import { useImageScanner } from '@/utils/useImageScanner';
import { ImageCard } from '@/components/ImageCard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { FilterBar, type FilterKind } from '@/components/FilterBar';
import type { ImageKind } from '@/types';

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

  // Filter state
  const [filter, setFilter] = useState<FilterKind>('all');

  // Counts per kind (plus 'all')
  const counts = useMemo(() => {
    const c: Record<FilterKind, number> = { all: emojis.length, emoji: 0, avatar: 0, other: 0 };
    for (const e of emojis) c[e.kind] += 1;
    return c;
  }, [emojis]);

  // Filtered emojis displayed in the grid
  const filteredEmojis = useMemo(
    () => (filter === 'all' ? emojis : emojis.filter((e) => e.kind === (filter as ImageKind))),
    [emojis, filter],
  );

  const previewEmoji = previewIndex !== null ? filteredEmojis[previewIndex] ?? null : null;

  // Reset preview if filtered list shrinks below current index
  useEffect(() => {
    if (previewIndex !== null && previewIndex >= filteredEmojis.length) {
      setPreviewIndex(null);
    }
  }, [filteredEmojis.length, previewIndex]);

  // Reset filter if it no longer has any items (keeps UI tidy after rescan)
  useEffect(() => {
    if (filter !== 'all' && counts[filter] === 0) setFilter('all');
  }, [counts, filter]);

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
    return <LoadingView />;
  }

  if (emojis.length === 0) {
    return <EmptyView onRetry={handleScan} />;
  }

  return (
    <div className="w-full h-dvh flex flex-col bg-background select-none">
      <SidePanelHeader total={emojis.length} />
      <FilterBar counts={counts} filter={filter} onFilterChange={setFilter} />
      <SidePanelToolbar
        total={filteredEmojis.length}
        selectedCount={selectedIds.size}
        allSelected={
          filteredEmojis.length > 0 &&
          filteredEmojis.every((e) => selectedIds.has(e.id))
        }
        downloading={zipping}
        onSelectAll={() => toggleSelectAll(filteredEmojis.map((e) => e.id))}
        onRescan={handleScan}
        onDownloadZip={downloadSelected}
      />

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {filteredEmojis.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-muted-foreground/60">{t('filterEmpty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5">
            {filteredEmojis.map((emoji, index) => (
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
        )}
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
            total={filteredEmojis.length}
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
