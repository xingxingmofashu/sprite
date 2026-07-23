import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
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
    <div className="shrink-0 flex items-center gap-1 px-4 py-2 border-b border-border overflow-x-auto">
      {FILTERS.map(({ key, labelKey }) => {
        const count = counts[key] ?? 0;
        const active = filter === key;
        return (
          <Button
            key={key}
            variant={active ? 'secondary' : 'ghost'}
            size="xs"
            disabled={count === 0 && key !== 'all'}
            onClick={() => onFilterChange(key)}
            className="disabled:opacity-40"
          >
            <span>{t(labelKey)}</span>
            <span className="ml-1 text-[10px] text-muted-foreground/70">{count}</span>
          </Button>
        );
      })}
    </div>
  );
}
