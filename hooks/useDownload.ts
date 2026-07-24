import { useCallback } from 'react';
import { DownloadMessage } from '@/types';

/**
 * Generic media download hook.
 * - `downloadSingle`: download one item via background
 * - `downloadZip`: batch-download selected items as a ZIP archive
 *
 * Works with any item carrying a `src` field (images, videos, …).
 */
export function useDownload() {
  const { t } = useI18n();

  const download = useCallback(async (item: { src: string }) => {
    try {
      await browser.runtime.sendMessage({ type: DownloadMessage.Single, items: [item] });
    } catch (err) {
      console.error('Download failed:', err);
      alert(t('downloadError'));
    }
  }, [t]);

  const downloadZip = useCallback(async (items: Array<{ src: string }>) => {
    if (items.length === 0) return;
    try {
      await browser.runtime.sendMessage({ type: DownloadMessage.Zip, items });
    } catch (err) {
      console.error('Batch download failed:', err);
      alert(t('downloadError'));
    }
  }, [t]);

  return { download, downloadZip };
}