import { useState, useMemo } from 'react';
import { useImageScanner } from '@/hooks/useImageScanner';
import { usePreview } from '@/hooks/usePreview';
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

  const [filter, setFilter] = useState<FilterKind>('all');

  const filteredEmojis = useMemo(
    () => (filter === 'all' ? emojis : emojis.filter((e) => e.kind === (filter as ImageKind))),
    [emojis, filter],
  );

  const { previewIndex, previewEmoji, openPreview, closePreview, prev, next } = usePreview(filteredEmojis);

  if (status === 'scanning') {
    return <LoadingView />;
  }

  if (emojis.length === 0) {
    return <EmptyView onRetry={handleScan} />;
  }

  return (
    <div className="w-full h-dvh flex flex-col bg-background select-none">
      <SidePanelHeader total={emojis.length} />
      <FilterBar emojis={emojis} filter={filter} onFilterChange={setFilter} />
      <SidePanelToolbar
        total={filteredEmojis.length}
        selectedIds={selectedIds}
        emojis={emojis}
        allSelected={
          filteredEmojis.length > 0 &&
          filteredEmojis.every((e) => selectedIds.has(e.id))
        }
        onSelectAll={() => toggleSelectAll(filteredEmojis.map((e) => e.id))}
        onRescan={handleScan}
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
                onPreview={() => openPreview(index)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 px-4 py-2 border-t border-border text-center">
        <p className="text-[11px] text-muted-foreground/50">{t('rightClickHint')}</p>
      </div>

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
            onPrev={prev}
            onNext={next}
            onClose={closePreview}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}

export default App;
