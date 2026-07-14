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
    <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
      <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer select-none">
        <input
          type="checkbox"
          className="accent-[#fe2c55] w-3.5 h-3.5"
          checked={allSelected && total > 0}
          onChange={onSelectAll}
        />
        <span>{t('selectAll')}</span>
      </label>

      <span className="text-xs text-gray-400">
        {t('selected', [String(selectedCount)])}
      </span>

      <div className="ml-auto flex gap-1.5">
        <button
          onClick={onRescan}
          className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-[0.97] transition-all cursor-pointer"
        >
          {t('rescan')}
        </button>
        <button
          onClick={onDownloadZip}
          disabled={selectedCount === 0 || downloading}
          className="px-3 py-1 rounded-md text-xs font-medium text-white bg-[#fe2c55] hover:bg-[#e0143f] disabled:bg-[#ffb3c5] disabled:cursor-not-allowed active:scale-[0.97] transition-all cursor-pointer"
        >
          {downloading ? t('packing') : t('downloadZip')}
        </button>
      </div>
    </div>
  );
}
