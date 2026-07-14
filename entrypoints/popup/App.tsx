import { useState, useEffect, useCallback } from 'react';
import './App.css';

interface EmojiInfo {
  src: string;
  alt: string;
  width: number;
  height: number;
  type: 'emoji' | 'sticker';
  id: string;
}

type Status = 'idle' | 'scanning' | 'done' | 'error';

function App() {
  const { t } = useI18n();
  const [emojis, setEmojis] = useState<EmojiInfo[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [downloading, setDownloading] = useState(false);

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
      setErrorMsg(`${t('scanError')}\n${t('scanErrorHint1')}\n${t('scanErrorHint2')}\n${t('scanErrorHint3')}`);
    }
  }, [getCurrentTab, t]);

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

  // ======== Header Component ========
  const Header = () => (
    <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b border-gray-100">
      <h1 className="text-base font-bold text-gray-900">😊 {t('extName')}</h1>
    </div>
  );

  // ======== Loading ========
  if (status === 'scanning') {
    return (
      <div className="w-[440px] min-h-[300px] flex flex-col items-center justify-center gap-3 bg-white select-none">
        <div className="spinner" />
        <p className="text-sm text-gray-500">{t('scanning')}</p>
      </div>
    );
  }

  // ======== Error ========
  if (status === 'error') {
    return (
      <div className="w-[440px] min-h-[300px] flex flex-col bg-white select-none">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-5 py-8 text-center">
          <p className="text-4xl m-0">⚠️</p>
          <p className="text-sm text-red-500 whitespace-pre-line leading-relaxed max-w-[360px]">{errorMsg}</p>
          <button
            onClick={handleScan}
            className="mt-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-[0.97] transition-all cursor-pointer"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  // ======== Empty ========
  if (emojis.length === 0) {
    return (
      <div className="w-[440px] min-h-[300px] flex flex-col bg-white select-none">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-1 px-5 py-8 text-center">
          <p className="text-4xl m-0">😅</p>
          <p className="text-sm text-gray-500">{t('noEmojisFound')}</p>
          <p className="text-xs text-gray-300 max-w-[300px]">{t('noEmojisHint')}</p>
          <button
            onClick={handleScan}
            className="mt-3 px-4 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-[0.97] transition-all cursor-pointer"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  // ======== Grid ========
  const stickerCount = emojis.filter((e) => e.type === 'sticker').length;
  const emojiCount = emojis.filter((e) => e.type === 'emoji').length;

  return (
    <div className="w-[440px] min-h-[300px] max-h-[560px] flex flex-col bg-white select-none">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b border-gray-100">
        <h1 className="text-base font-bold text-gray-900">😊 {t('extName')}</h1>
        <p className="mt-0.5 text-xs text-gray-400">
          {t('totalEmojis', [String(emojis.length), String(emojiCount), String(stickerCount)])}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
        <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            className="accent-[#fe2c55] w-3.5 h-3.5"
            checked={selectedIds.size === emojis.length}
            onChange={toggleSelectAll}
          />
          <span>{t('selectAll')}</span>
        </label>
        <span className="text-xs text-gray-400">
          {t('selected', [String(selectedIds.size)])}
        </span>
        <div className="ml-auto flex gap-1.5">
          <button
            onClick={handleScan}
            className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-[0.97] transition-all cursor-pointer"
          >
            {t('rescan')}
          </button>
          <button
            onClick={downloadSelected}
            disabled={selectedIds.size === 0 || downloading}
            className="px-3 py-1 rounded-md text-xs font-medium text-white bg-[#fe2c55] hover:bg-[#e0143f] disabled:bg-[#ffb3c5] disabled:cursor-not-allowed active:scale-[0.97] transition-all cursor-pointer"
          >
            {downloading ? t('packing') : t('downloadZip')}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="emoji-grid">
          {emojis.map((emoji) => (
            <div
              key={emoji.id}
              onClick={() => toggleSelect(emoji.id)}
              className={`emoji-card relative flex items-center justify-center aspect-square rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${
                selectedIds.has(emoji.id)
                  ? 'border-[#fe2c55] bg-[#fef0f3]'
                  : 'border-transparent bg-gray-50 hover:border-[#fe2c55] hover:bg-[#fef0f3]'
              }`}
            >
              {/* Checkbox */}
              <div className="absolute top-1 left-1 z-10">
                <input
                  type="checkbox"
                  className="accent-[#fe2c55] w-3.5 h-3.5 cursor-pointer"
                  checked={selectedIds.has(emoji.id)}
                  onChange={() => toggleSelect(emoji.id)}
                />
              </div>

              {/* Image */}
              <img
                src={emoji.src}
                alt={emoji.alt}
                loading="lazy"
                className={`block pointer-events-none ${
                  emoji.type === 'sticker' ? 'max-w-[90%] max-h-[90%]' : 'max-w-[80%] max-h-[80%]'
                } object-contain`}
              />

              {/* Download button overlay */}
              <button
                title={t('downloadTooltip')}
                onClick={(e) => { e.stopPropagation(); downloadSingle(emoji); }}
                className="download-btn-overlay cursor-pointer"
              >
                <span className="text-white text-xs leading-none">⬇</span>
              </button>

              {/* Type badge */}
              <span className="emoji-badge text-white">
                {emoji.type === 'sticker' ? t('badgeSticker') : t('badgeEmoji')}
              </span>
            </div>
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
