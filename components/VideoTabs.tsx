import { useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { VideoCard } from '@/components/VideoCard';
import type { VideoInfo, VideoKind } from '@/types';

export type VideoTab = VideoKind | 'all';

interface VideoTabsProps {
  videos: VideoInfo[];
  tab: VideoTab;
  onTabChange: (tab: VideoTab) => void;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onDownload: (video: VideoInfo) => void;
  onPreview: (video: VideoInfo) => void;
}

const TABS: { key: VideoTab; labelKey: string }[] = [
  { key: 'all', labelKey: 'filterAll' },
  { key: 'video', labelKey: 'filterVideo' },
  { key: 'other', labelKey: 'filterOther' },
];

export function VideoTabs({
  videos,
  tab,
  onTabChange,
  selectedIds,
  onToggle,
  onDownload,
  onPreview,
}: VideoTabsProps) {
  const { t } = useI18n();

  const grouped = useMemo(() => {
    const all = videos;
    const video = videos.filter((e) => e.kind === 'video');
    const other = videos.filter((e) => e.kind === 'other');
    return { all, video, other };
  }, [videos]);

  return (
    <Tabs
      value={tab}
      onValueChange={(val) => onTabChange(val as VideoTab)}
      className="flex flex-col flex-1 min-h-0"
    >
      <div className="shrink-0 px-4 py-2 border-b border-border">
        <TabsList className="h-7">
          {TABS.map(({ key, labelKey }) => {
            const count = grouped[key].length;
            return (
              <TabsTrigger
                key={key}
                value={key}
                disabled={count === 0 && key !== 'all'}
                className="gap-1 text-xs px-2 py-0.5"
              >
                {t(labelKey)}
                <span className="text-[10px] text-muted-foreground/70">{count}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      {TABS.map(({ key }) => {
        const list = grouped[key];
        return (
          <TabsContent key={key} value={key} className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
            {list.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-xs text-muted-foreground/60">{t('filterEmpty')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5">
                {list.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    selected={selectedIds.has(video.id)}
                    onToggle={onToggle}
                    onDownload={onDownload}
                    onPreview={onPreview}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}