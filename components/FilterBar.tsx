import { useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ImageInfo, ImageKind } from '@/types';

export type FilterKind = ImageKind | 'all';

interface FilterBarProps {
  emojis: ImageInfo[];
  filter: FilterKind;
  onFilterChange: (filter: FilterKind) => void;
}

const FILTERS: { key: FilterKind; labelKey: string }[] = [
  { key: 'all', labelKey: 'filterAll' },
  { key: 'emoji', labelKey: 'filterEmoji' },
  { key: 'avatar', labelKey: 'filterAvatar' },
  { key: 'other', labelKey: 'filterOther' },
];

export function FilterBar({ emojis, filter, onFilterChange }: FilterBarProps) {
  const { t } = useI18n();

  const counts = useMemo(() => {
    const c: Record<FilterKind, number> = { all: emojis.length, emoji: 0, avatar: 0, other: 0 };
    for (const e of emojis) c[e.kind] += 1;
    return c;
  }, [emojis]);

  return (
    <Tabs
      value={filter}
      onValueChange={(val) => onFilterChange(val as FilterKind)}
      className="shrink-0 px-4 py-2 border-b border-border"
    >
      <TabsList className="h-7">
        {FILTERS.map(({ key, labelKey }) => {
          const count = counts[key] ?? 0;
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
    </Tabs>
  );
}