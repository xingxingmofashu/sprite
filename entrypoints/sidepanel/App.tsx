import { useState, useMemo } from 'react';
import { useImageScanner } from '@/hooks/useImageScanner';
import { usePreview } from '@/hooks/usePreview';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ImageTabs, type ImageTab } from '@/components/ImageTabs';

function App() {
  const { t } = useI18n();
  const {
    images,
    selectedIds,
    status,
    handleScan,
    toggleSelect,
    toggleSelectAll,
    downloadSingle,
  } = useImageScanner();

  const [tab, setTab] = useState<ImageTab>('all');

  const filteredImages = useMemo(
    () => (tab === 'all' ? images : images.filter((e) => e.kind === tab)),
    [images, tab],
  );

  const { previewIndex, previewImage, openPreview, closePreview, prev, next } = usePreview(filteredImages);

  if (status === 'scanning') {
    return <LoadingView />;
  }

  if (images.length === 0) {
    return <EmptyView onRetry={handleScan} />;
  }

  return (
    <div className="w-full h-dvh flex flex-col bg-background select-none">
      <SidePanelHeader total={images.length} />
      <SidePanelToolbar
        total={filteredImages.length}
        selectedIds={selectedIds}
        images={images}
        allSelected={
          filteredImages.length > 0 &&
          filteredImages.every((e) => selectedIds.has(e.id))
        }
        onSelectAll={() => toggleSelectAll(filteredImages.map((e) => e.id))}
        onRescan={handleScan}
      />
      <ImageTabs
        images={images}
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

      {previewImage && (
        <ErrorBoundary fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <p className="text-white text-sm">Preview unavailable</p>
          </div>
        }>
          <ImagePreview
            image={previewImage}
            index={previewIndex!}
            total={filteredImages.length}
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