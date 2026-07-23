import { useState, useEffect, useCallback } from 'react';
import type { ImageInfo } from '@/types';

type Status = 'idle' | 'scanning' | 'done' | 'error';

interface UseImageScannerReturn {
  emojis: ImageInfo[];
  selectedIds: Set<string>;
  status: Status;
  handleScan: () => Promise<void>;
  toggleSelect: (id: string) => void;
  toggleSelectAll: (ids?: string[]) => void;
  downloadSingle: (emoji: ImageInfo) => Promise<void>;
}

/**
 * Hook managing the full emoji scanning lifecycle:
 * - Scans current douyin tab for emoji images
 * - Manages selection state
 * - Handles single and batch download
 */
export function useImageScanner(): UseImageScannerReturn {
  const { t } = useI18n();
  const [emojis, setEmojis] = useState<ImageInfo[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<Status>('idle');

  const handleScan = useCallback(async () => {
    setStatus('scanning');

    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id || !tab.url?.includes('douyin.com')) {
        setStatus('error');
        return;
      }

      const response = await browser.tabs.sendMessage(tab.id, { type: 'SCAN_IMAGES' });
      const result = response as { emojis: ImageInfo[] } | undefined;

      setEmojis(result?.emojis ?? []);
      setSelectedIds(new Set());
      setStatus('done');
    } catch (err) {
      console.error('Scan failed:', err);
      setStatus('error');
    }
  }, [t]);

  // Auto-scan on mount
  useEffect(() => { handleScan(); }, [handleScan]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((ids?: string[]) => {
    const targetIds = ids ?? emojis.map((e) => e.id);
    setSelectedIds((prev) => {
      const allTargetSelected = targetIds.length > 0 && targetIds.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allTargetSelected) {
        targetIds.forEach((id) => next.delete(id));
      } else {
        targetIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [emojis]);

  const downloadSingle = useCallback(async (emoji: ImageInfo) => {
    try {
      await browser.runtime.sendMessage({ type: 'DOWNLOAD_SINGLE', emojis: [emoji] });
    } catch (err) {
      console.error('Download failed:', err);
      alert(t('downloadError'));
    }
  }, [t]);

  return {
    emojis,
    selectedIds,
    status,
    handleScan,
    toggleSelect,
    toggleSelectAll,
    downloadSingle,
  };
}
