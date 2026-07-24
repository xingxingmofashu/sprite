import { useState } from 'react';
import type { VideoInfo } from '@/types';
import { VideoTabs, type VideoTab } from '@/components/VideoTabs';

interface VideosPageProps {
  videos: VideoInfo[];
  onRescan: () => void;
}

export function VideosPage({ videos, onRescan }: VideosPageProps) {
  const { download, downloadZip } = useDownload();
  const { selectedIds, toggleSelect, toggleSelectAll } = useSelection<VideoInfo>(videos);

  const [tab, setTab] = useState<VideoTab>('all');

  const handleDownloadZip = async () => {
    const selected = videos.filter((e) => selectedIds.has(e.id));
    await downloadZip(selected);
  };

  return (
    <>
      <SidePanelToolbar
        selectedCount={selectedIds.size}
        totalCount={videos.length}
        allSelected={videos.length > 0 && videos.every((e) => selectedIds.has(e.id))}
        onSelectAll={() => toggleSelectAll(videos.map((e) => e.id))}
        onRescan={onRescan}
        onDownloadZip={handleDownloadZip}
      />

      <VideoTabs
        videos={videos}
        tab={tab}
        onTabChange={setTab}
        selectedIds={selectedIds}
        onToggle={toggleSelect}
        onDownload={download}
        onPreview={() => {}}
      />
    </>
  );
}