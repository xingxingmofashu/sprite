import { useState, useEffect, useCallback } from 'react';
import type { EmojiInfo } from '@/utils/types';
import { useEmojiProxy } from '@/utils/useEmojiProxy';
import './App.css';

type Status = 'idle' | 'scanning' | 'done' | 'error';

function App() {
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

  useEffect(() => {
    handleScan();
  }, [handleScan]);

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

  // ======== Loading ========
  if (status === 'scanning') {
    return <LoadingView onRetry={handleScan} />;
  }

  // ======== Error ========
  if (status === 'error') {
    return <ErrorView message={errorMsg} onRetry={handleScan} />;
  }

  // ======== Empty ========
  if (emojis.length === 0) {
    return <EmptyView onRetry={handleScan} />;
  }

  // ======== Grid ========
  const stickerCount = emojis.filter((e) => e.type === 'sticker').length;
  const emojiCount = emojis.filter((e) => e.type === 'emoji').length;

  return (
    <div className="w-[440px] min-h-[300px] max-h-[560px] flex flex-col bg-white select-none">
      <PopupHeader total={emojis.length} emojiCount={emojiCount} stickerCount={stickerCount} />
      <PopupToolbar
        total={emojis.length}
        selectedCount={selectedIds.size}
        allSelected={selectedIds.size === emojis.length}
        downloading={downloading}
        onSelectAll={toggleSelectAll}
        onRescan={handleScan}
        onDownloadZip={downloadSelected}
      />

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="emoji-grid">
          {emojis.map((emoji) => (
            <EmojiCard
              key={emoji.id}
              emoji={emoji}
              selected={selectedIds.has(emoji.id)}
              proxiedUrl={proxiedUrls[emoji.src]}
              onToggle={toggleSelect}
              onDownload={downloadSingle}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-gray-100 text-center">
        <p className="text-[11px] text-gray-300">{t('rightClickHint')}</p>
      </div>
    </div>
  );
}

export default App;
