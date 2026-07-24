import { useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ImagesPage } from './pages/ImagesPage';
import { VideosPage } from './pages/VideosPage';

function App() {
  const { t } = useI18n();
  const { images, videos, status, scan } = useMediaScan();

  const handleScan = useCallback(() => { scan(); }, [scan]);

  if (status === 'scanning') {
    return <LoadingView />;
  }

  return (
    <div className="w-full h-dvh flex flex-col bg-background select-none">
      <SidePanelHeader
        imageCount={images.length}
        videoCount={videos.length}
      />

      <Routes>
        <Route
          path="/"
          element={<HomePage imageCount={images.length} videoCount={videos.length} onScan={handleScan} />}
        />
        <Route
          path="/images"
          element={<ImagesPage images={images} onRescan={handleScan} />}
        />
        <Route
          path="/videos"
          element={<VideosPage videos={videos} onRescan={handleScan} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <div className="shrink-0 px-4 py-2 border-t border-border text-center">
        <p className="text-[11px] text-muted-foreground/50">{t('rightClickHint')}</p>
      </div>
    </div>
  );
}

export default App;