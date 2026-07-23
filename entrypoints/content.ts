import hash from '@emotion/hash';
import type { ImageInfo, ImageKind, ScanResponse } from '@/types';

/** Classify an image into emoji / avatar / other based on class names and URL */
function classifyImage(img: HTMLImageElement, src: string): ImageKind {
  const className = img.className;

  // Emoji: class contains "MessageItemEmojiimage" (emoji-specific marker, case-insensitive)
  if (/MessageItemEmojiimage/i.test(className)) {
    return 'emoji';
  }

  // Avatar: class contains "commonConversationIconnoDrag" OR url contains "sc=avatar"
  if (className.toLowerCase().includes('commonconversationiconnodrag') || src.includes('sc=avatar')) {
    return 'avatar';
  }

  return 'other';
}

// ============ Scan ============

/** Scan DOM <img> elements for CDN-hosted images */
function scanForEmojis(): ImageInfo[] {
  const results: ImageInfo[] = [];
  const seen = new Set<string>();
  const images = document.querySelectorAll('img');

  images.forEach((img) => {
    const src = img.currentSrc || img.src || '';
    if (!src || src.startsWith('data:') || seen.has(src)) return;
    seen.add(src);

    const width = img.naturalWidth || img.width || 0;
    const height = img.naturalHeight || img.height || 0;
    if (width === 0 && height === 0) return;

    results.push({
      src,
      alt: (img.alt || '').trim(),
      width,
      height,
      id: hash(src),
      kind: classifyImage(img, src),
    });
  });

  return results;
}

export default defineContentScript({
  matches: ['*://*.douyin.com/*'],
  main() {
    browser.runtime.onMessage.addListener((message: { type: string }, _sender) => {
      if (message.type === 'SCAN_IMAGES') {
        const emojis = scanForEmojis();
        return Promise.resolve<ScanResponse>({ emojis });
      }
    });
  },
});