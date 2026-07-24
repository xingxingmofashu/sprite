import { useState, useMemo } from 'react';
import type { ImageInfo } from '@/types';
import { usePreview } from '@/hooks/usePreview';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ImageTabs, type ImageTab } from '@/components/ImageTabs';

interface ImagesPageProps {
  images: ImageInfo[];
  onRescan: () => void;
}

export function ImagesPage({ images, onRescan }: ImagesPageProps) {
  const { download, downloadZip } = useDownload();
  const { selectedIds, toggleSelect, toggleSelectAll } = useSelection<ImageInfo>(images);

  const [tab, setTab] = useState<ImageTab>('all');

  const filteredImages = useMemo(
    () => (tab === 'all' ? images : images.filter((e) => e.kind === tab)),
    [images, tab],
  );

  const { previewIndex, previewImage, openPreview, closePreview, prev, next } = usePreview(filteredImages);

  const handleDownloadZip = async () => {
    const selected = images.filter((e) => selectedIds.has(e.id));
    await downloadZip(selected);
  };

  return (
    <>
      <SidePanelToolbar
        selectedCount={selectedIds.size}
        totalCount={images.length}
        allSelected={images.length > 0 && images.every((e) => selectedIds.has(e.id))}
        onSelectAll={() => toggleSelectAll(images.map((e) => e.id))}
        onRescan={onRescan}
        onDownloadZip={handleDownloadZip}
      />

      <ImageTabs
        images={images}
        tab={tab}
        onTabChange={setTab}
        selectedIds={selectedIds}
        onToggle={toggleSelect}
        onDownload={download}
        onPreview={openPreview}
      />

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
    </>
  );
}