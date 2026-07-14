import type { EmojiInfo, ScanResponse } from '@/utils/types';

/**
 * 扫描抖音页面中的所有 CDN 图片
 */
function scanForEmojis(): EmojiInfo[] {
  const seen = new Set<string>();
  let index = 0;
  const results: EmojiInfo[] = [];

  const images = document.querySelectorAll('img');

  images.forEach((img) => {
    const src = img.currentSrc || img.src || '';

    if (!src || src.startsWith('data:')) return;
    if (seen.has(src)) return;

    // 只保留抖音 CDN 图片
    if (!/douyincdn|pstatp|bytecdn|byteimg|toutiaoimg|ixiguavideo/.test(src)) return;

    seen.add(src);

    const width = img.naturalWidth || img.width || 0;
    const height = img.naturalHeight || img.height || 0;

    // 跳过未加载完成、没有实际尺寸的图片
    if (width === 0 && height === 0) return;

    results.push({
      src,
      alt: (img.alt || '').trim(),
      width,
      height,
      type:
        src.includes('.gif') || src.includes('sticker') || width > 150 || height > 150
          ? 'sticker'
          : 'emoji',
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
