import { useState, useEffect, useCallback } from 'react';
import type { EmojiInfo } from '@/utils/types';
import { useEmojiProxy } from '@/utils/useEmojiProxy';

type Status = 'idle' | 'scanning' | 'done' | 'error';

interface UseEmojiScannerReturn {
  emojis: EmojiInfo[];
  selectedIds: Set<string>;
  status: Status;
  errorMsg: string;
  downloading: boolean;
  proxiedUrls: Record<string, string>;
  handleScan: () => Promise<void>;
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  downloadSingle: (emoji: EmojiInfo) => Promise<void>;
  downloadSelected: () => Promise<void>;
}

/**
 * Hook managing the full emoji scanning lifecycle:
 * - Scans current douyin tab for emoji images
 * - Manages selection state
 * - Handles single and batch download
 * - Proxies images through background for CORS-free display
 */
export function useEmojiScanner(): UseEmojiScannerReturn {
  const { t } = useI18n();
  const [emojis, setEmojis] = useState<EmojiInfo[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [downloading, setDownloading] = useState(false);

  const proxiedUrls = useEmojiProxy(emojis);

  const getCurrentTab = useCallback(async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    return tab;
  }, []);

  const handleScan = useCallback(async () => {
    setStatus('scanning');
    setErrorMsg('');

    try {
      const tab = await getCurrentTab();
      if (!tab?.id || !tab.url?.includes('douyin.com')) {
        setStatus('error');
        setErrorMsg(t('scanError'));
        return;
      }

      const response = await browser.tabs.sendMessage(tab.id, { type: 'SCAN_EMOJIS' });
      const result = response as { emojis: EmojiInfo[] } | undefined;

      if (result?.emojis && result.emojis.length > 0) {
        setEmojis(result.emojis);
        setSelectedIds(new Set(result.emojis.map((e) => e.id)));
      } else {
        setEmojis([]);
        setSelectedIds(new Set());
      }
      setStatus('done');
    } catch (err) {
      console.error('Scan failed:', err);
      setStatus('error');
      setErrorMsg(
        `${t('scanError')}\n${t('scanErrorHint1')}\n${t('scanErrorHint2')}\n${t('scanErrorHint3')}`,
      );
    }
  }, [getCurrentTab, t]);

  // Auto-scan on mount
  useEffect(() => { handleScan(); }, [handleScan]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.size === emojis.length
        ? new Set()
        : new Set(emojis.map((e) => e.id)),
    );
  };

  const downloadSingle = async (emoji: EmojiInfo) => {
    setDownloading(true);
    try {
      await browser.runtime.sendMessage({ type: 'DOWNLOAD_SINGLE', emojis: [emoji] });
    } catch (err) {
      console.error('Download failed:', err);
    }
    setDownloading(false);
  };

  const downloadSelected = async () => {
    const selected = emojis.filter((e) => selectedIds.has(e.id));
    if (selected.length === 0) return;
    setDownloading(true);
    try {
      await browser.runtime.sendMessage({ type: 'DOWNLOAD_ZIP', emojis: selected });
    } catch (err) {
      console.error('Batch download failed:', err);
    }
    setDownloading(false);
  };

  return {
    emojis,
    selectedIds,
    status,
    errorMsg,
    downloading,
    proxiedUrls,
    handleScan,
    toggleSelect,
    toggleSelectAll,
    downloadSingle,
    downloadSelected,
  };
}
