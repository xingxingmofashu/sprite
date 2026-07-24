import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface SidePanelToolbarProps {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  onSelectAll: () => void;
  onRescan: () => void;
  onDownloadZip: () => Promise<void>;
}

/** Toolbar: select-all, count, and action buttons */
export function SidePanelToolbar({
  selectedCount,
  totalCount,
  allSelected,
  onSelectAll,
  onRescan,
  onDownloadZip,
}: SidePanelToolbarProps) {
  const { t } = useI18n();
  const [zipping, setZipping] = useState(false);

  const download = useCallback(async () => {
    if (selectedCount === 0) return;
    setZipping(true);
    await onDownloadZip();
    setZipping(false);
  }, [selectedCount, onDownloadZip]);

  return (
    <div className="shrink-0 flex items-center gap-2 px-4 py-2 border-b border-border">
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
        <Checkbox checked={allSelected && totalCount > 0} onCheckedChange={onSelectAll} className="size-3.5" />
        <span>{t('selectAll')}</span>
      </label>

      <span className="text-xs text-muted-foreground/70">
        {t('selected', [String(selectedCount)])}
      </span>

      <div className="ml-auto flex gap-1.5">
        <Button variant="secondary" size="sm" onClick={onRescan}>
          {t('rescan')}
        </Button>
        <Button
          size="sm"
          onClick={download}
          disabled={selectedCount === 0 || zipping}
          className="disabled:opacity-50"
        >
          {zipping ? t('packing') : t('downloadZip')}
        </Button>
      </div>
    </div>
  );
}