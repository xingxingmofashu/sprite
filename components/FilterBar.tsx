import { Button } from '@/components/ui/button';
import type { ImageKind } from '@/types';

export type FilterKind = ImageKind | 'all';

interface FilterBarProps {
  counts: Record<FilterKind, number>;
  filter: FilterKind;
  onFilterChange: (filter: FilterKind) => void;
}

const FILTERS: { key: FilterKind; labelKey: string }[] = [
  { key: 'all', labelKey: 'filterAll' },
  { key: 'emoji', labelKey: 'filterEmoji' },
  { key: 'avatar', labelKey: 'filterAvatar' },
  { key: 'other', labelKey: 'filterOther' },
];

export function FilterBar({ counts, filter, onFilterChange }: FilterBarProps) {
  const { t } = useI18n();

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