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
        setErrorMsg('请先在抖音网页版中打开聊天页面');
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
      console.error('扫描失败:', err);
      setStatus('error');
      setErrorMsg('扫描失败，请确认：\n1. 当前页面是抖音网页版 (douyin.com)\n2. 已打开聊天对话框\n3. 如果问题持续，请刷新页面后重试');
    }
  }, [getCurrentTab]);

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
      console.error('下载失败:', err);
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
      console.error('批量下载失败:', err);
    }
    setDownloading(false);
  };

  // ======== Loading ========
  if (status === 'scanning') {
    return (
      <div className="w-[440px] min-h-[300px] flex flex-col items-center justify-center gap-3 bg-white select-none">
        <div className="spinner" />
        <p className="text-sm text-gray-500">正在扫描表情包...</p>
      </div>
    );
  }

  // ======== Error ========
  if (status === 'error') {
    return (
      <div className="w-[440px] min-h-[300px] flex flex-col bg-white select-none">
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-900">😊 抖音表情包下载器</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-5 py-8 text-center">
          <p className="text-4xl m-0">⚠️</p>
          <p className="text-sm text-red-500 whitespace-pre-line leading-relaxed max-w-[360px]">{errorMsg}</p>
          <button
            onClick={handleScan}
            className="mt-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-[0.97] transition-all cursor-pointer"
          >
            重新扫描
          </button>
        </div>
      </div>
    );
  }

  // ======== Empty ========
  if (emojis.length === 0) {
    return (
      <div className="w-[440px] min-h-[300px] flex flex-col bg-white select-none">
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-900">😊 抖音表情包下载器</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-1 px-5 py-8 text-center">
          <p className="text-4xl m-0">😅</p>
          <p className="text-sm text-gray-500">当前页面没有发现表情包</p>
          <p className="text-xs text-gray-300">请确保已打开聊天对话框，并刷新页面后重试</p>
          <button
            onClick={handleScan}
            className="mt-3 px-4 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-[0.97] transition-all cursor-pointer"
          >
            重新扫描
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
        <h1 className="text-base font-bold text-gray-900">😊 抖音表情包下载器</h1>
        <p className="mt-0.5 text-xs text-gray-400">
          共 {emojis.length} 个（{emojiCount} 表情 · {stickerCount} 贴图）
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
          <span>全选</span>
        </label>
        <span className="text-xs text-gray-400">已选 {selectedIds.size} 个</span>
        <div className="ml-auto flex gap-1.5">
          <button
            onClick={handleScan}
            className="px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-[0.97] transition-all cursor-pointer"
          >
            重新扫描
          </button>
          <button
            onClick={downloadSelected}
            disabled={selectedIds.size === 0 || downloading}
            className="px-3 py-1 rounded-md text-xs font-medium text-white bg-[#fe2c55] hover:bg-[#e0143f] disabled:bg-[#ffb3c5] disabled:cursor-not-allowed active:scale-[0.97] transition-all cursor-pointer"
          >
            {downloading ? '打包中...' : '下载选中 (ZIP)'}
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
                crossOrigin="anonymous"
                loading="lazy"
                className={`block pointer-events-none ${
                  emoji.type === 'sticker' ? 'max-w-[90%] max-h-[90%]' : 'max-w-[80%] max-h-[80%]'
                } object-contain`}
              />

              {/* Download button overlay */}
              <button
                title="下载此表情包"
                onClick={(e) => { e.stopPropagation(); downloadSingle(emoji); }}
                className="download-btn-overlay cursor-pointer"
              >
                <span className="text-white text-xs leading-none">⬇</span>
              </button>

              {/* Type badge */}
              <span className="emoji-badge text-white">
                {emoji.type === 'sticker' ? '贴图' : '表情'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-gray-100 text-center">
        <p className="text-[11px] text-gray-300">💡 右键点击页面中的图片，选择「下载此表情包」也可快速下载</p>
      </div>
    </div>
  );
}

export default App;
