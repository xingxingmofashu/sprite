import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { ImageInfo } from '@/types';

interface SidePanelToolbarProps {
  total: number;
  selectedIds: Set<string>;
  emojis: ImageInfo[];
  allSelected: boolean;
  onSelectAll: () => void;
  onRescan: () => void;
}

/** Toolbar: select-all, count, and action buttons */
export function SidePanelToolbar({
  total,
  selectedIds,
  emojis,
  allSelected,
  onSelectAll,
  onRescan,
}: SidePanelToolbarProps) {
  const { t } = useI18n();
  const [zipping, setZipping] = useState(false);

  const selectedCount = selectedIds.size;

  const downloadSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setZipping(true);
    try {
      const selected = emojis.filter((e) => selectedIds.has(e.id));
      await browser.runtime.sendMessage({ type: 'DOWNLOAD_ZIP', emojis: selected });
    } catch (err) {
      console.error('Batch download failed:', err);
      alert(t('downloadError'));
    }
    setZipping(false);
  }, [emojis, selectedIds, t]);

  return (
    <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 border-b border-border">
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
        <Checkbox checked={allSelected && total > 0} onCheckedChange={onSelectAll} className="size-3.5" />
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
          onClick={downloadSelected}
          disabled={selectedCount === 0 || zipping}
          className="disabled:opacity-50"
        >
          {zipping ? t('packing') : t('downloadZip')}
        </Button>
      </div>
    </div>
  );
}
