import { useState, useMemo } from 'react';
import { useImageScanner } from '@/hooks/useImageScanner';
import { usePreview } from '@/hooks/usePreview';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ImageTabs, type ImageTab } from '@/components/ImageTabs';
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

  const [tab, setTab] = useState<ImageTab>('all');

  const filteredEmojis = useMemo(
    () => (tab === 'all' ? emojis : emojis.filter((e) => e.kind === (tab as ImageKind))),
    [emojis, tab],
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
      <ImageTabs
        emojis={emojis}
        tab={tab}
        onTabChange={setTab}
        selectedIds={selectedIds}
        onToggle={toggleSelect}
        onDownload={downloadSingle}
        onPreview={openPreview}
      />

      <div className="shrink-0 px-4 py-2 border-t border-border text-center">
        <p className="text-[11px] text-muted-foreground/50">{t('rightClickHint')}</p>
      </div>

      {previewEmoji && (
        <ErrorBoundary fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <p className="text-white text-sm">Preview unavailable</p>
          </div>
        }>
          <ImagePreview
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