export interface EmojiInfo {
  src: string;
  alt: string;
  width: number;
  height: number;
  type: 'emoji' | 'sticker';
  id: string;
}

export interface ScanResponse {
  emojis: EmojiInfo[];
}

/**
 * 扫描抖音页面中的所有 CDN 图片（头像、表情包、贴图等）
 */
function scanForEmojis(): EmojiInfo[] {
  const seen = new Set<string>();
  let index = 0;
  const results: EmojiInfo[] = [];

  const images = document.querySelectorAll('img');

  images.forEach((img) => {
    const src = img.currentSrc || img.src || '';

    // 基础过滤
    if (!src || seen.has(src) || src.startsWith('data:')) return;
    seen.add(src);

    // 只保留抖音 CDN 图片
    if (!/douyincdn|pstatp|bytecdn|byteimg|toutiaoimg|ixiguavideo/.test(src)) return;

    const width = img.naturalWidth || img.width || 0;
    const height = img.naturalHeight || img.height || 0;

    results.push({
      src,
      alt: (img.alt || '').trim(),
      width,
      height,
      type: src.includes('.gif') || width > 150 || height > 150 ? 'sticker' : 'emoji',
      id: `emoji-${index++}`,
    });
  });

  return results;
}

export default defineContentScript({
  matches: ['*://*.douyin.com/*'],
  main() {
    browser.runtime.onMessage.addListener((message: { type: string }, _sender) => {
      if (message.type === 'SCAN_EMOJIS') {
        const emojis = scanForEmojis();
        return Promise.resolve<ScanResponse>({ emojis });
      }
    });
  },
});
