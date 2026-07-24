import { useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ImageCard } from '@/components/ImageCard';
import type { ImageInfo, ImageKind } from '@/types';

export type ImageTab = ImageKind | 'all';

interface ImageTabsProps {
  images: ImageInfo[];
  tab: ImageTab;
  onTabChange: (tab: ImageTab) => void;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onDownload: (image: ImageInfo) => void;
  onPreview: (index: number) => void;
}

const TABS: { key: ImageTab; labelKey: string }[] = [
  { key: 'all', labelKey: 'filterAll' },
  { key: 'emoji', labelKey: 'filterEmoji' },
  { key: 'avatar', labelKey: 'filterAvatar' },
  { key: 'other', labelKey: 'filterOther' },
];

export function ImageTabs({
  images,
  tab,
  onTabChange,
  selectedIds,
  onToggle,
  onDownload,
  onPreview,
}: ImageTabsProps) {
  const { t } = useI18n();

  const grouped = useMemo(() => {
    const all = images;
    const emoji = images.filter((e) => e.kind === 'emoji');
    const avatar = images.filter((e) => e.kind === 'avatar');
    const other = images.filter((e) => e.kind === 'other');
    return { all, emoji, avatar, other };
  }, [images]);

  return (
    <Tabs
      value={tab}
      onValueChange={(val) => onTabChange(val as ImageTab)}
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
                {list.map((image, index) => (
                  <ImageCard
                    key={image.id}
                    image={image}
                    selected={selectedIds.has(image.id)}
                    onToggle={onToggle}
                    onDownload={onDownload}
                    onPreview={() => onPreview(index)}
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