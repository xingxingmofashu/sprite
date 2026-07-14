import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/utils/cn';

interface PopupToolbarProps {
  total: number;
  selectedCount: number;
  allSelected: boolean;
  downloading: boolean;
  onSelectAll: () => void;
  onRescan: () => void;
  onDownloadZip: () => void;
}

/** Toolbar: select-all, count, and action buttons */
export function PopupToolbar({
  total,
  selectedCount,
  allSelected,
  downloading,
  onSelectAll,
  onRescan,
  onDownloadZip,
}: PopupToolbarProps) {
  const { t } = useI18n();

  return (
    <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 border-b border-border">
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
          onClick={onDownloadZip}
          disabled={selectedCount === 0 || downloading}
          className={cn(
            'bg-[#fe2c55] hover:bg-[#e0143f] disabled:opacity-50',
            !downloading && selectedCount > 0 && 'text-white',
          )}
        >
          {downloading ? t('packing') : t('downloadZip')}
        </Button>
      </div>
    </div>
  );
}
