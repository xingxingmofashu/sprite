import type { EmojiInfo, ScanResponse } from '@/utils/types';

/** Douyin CDN domain regex */
const CDN_PATTERN = /douyincdn|pstatp|bytecdn|byteimg|toutiaoimg|ixiguavideo/;

// ============ Scan ============

/** Use the image URL as the stable identifier to guarantee unique React keys */
function idFromUrl(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0;
  }
  return `e-${Math.abs(hash).toString(36)}`;
}

/** Scan DOM <img> elements for CDN-hosted images */
function scanForEmojis(): EmojiInfo[] {
  const results: EmojiInfo[] = [];
  const seen = new Set<string>();
  const images = document.querySelectorAll('img');

  images.forEach((img) => {
    const src = img.currentSrc || img.src || '';
    if (!src || src.startsWith('data:') || seen.has(src)) return;
    if (!CDN_PATTERN.test(src)) return;
    seen.add(src);

    const width = img.naturalWidth || img.width || 0;
    const height = img.naturalHeight || img.height || 0;
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
      id: idFromUrl(src),
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
