import type { EmojiInfo, ScanResponse } from '@/utils/types';

/** Douyin CDN domain regex */
const CDN_PATTERN = /douyincdn|pstatp|bytecdn|byteimg|toutiaoimg|ixiguavideo/;

// ============ Real-time network monitoring ============

/** Image URLs captured via PerformanceObserver (same as DevTools Network tab) */
const networkUrls = new Set<string>();

/**
 * Watch page network requests for image resources.
 * Works like the DevTools Network panel — captures every <img> load in real time.
 */
function setupNetworkMonitor(): void {
  // 1) Capture already-loaded resources
  try {
    for (const entry of performance.getEntriesByType('resource')) {
      if (entry.initiatorType === 'img' && CDN_PATTERN.test(entry.name)) {
        networkUrls.add(entry.name);
      }
    }
  } catch { /* performance API not available */ }

  // 2) Continuously watch new resources (real-time capture)
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (CDN_PATTERN.test(entry.name)) {
          networkUrls.add(entry.name);
        }
      }
    });
    observer.observe({ type: 'resource', buffered: true });
  } catch { /* PerformanceObserver not supported */ }
}

// ============ Scan ============

/** Use the image URL as the stable identifier to guarantee unique React keys */
function idFromUrl(url: string): string {
  // Simple hash of the URL for a shorter, readable key
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0;
  }
  return `e-${Math.abs(hash).toString(36)}`;
}

/** Scan DOM <img> elements for CDN-hosted images */
function scanDom(): EmojiInfo[] {
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

// ============ Merge ============

/** Merge DOM scan + network-monitored results, deduped by URL */
function scanForEmojis(): EmojiInfo[] {
  const domResults = scanDom();

  // Network-captured URLs — has URL but no dimensions
  const networkResults: EmojiInfo[] = [];
  for (const url of networkUrls) {
    networkResults.push({
      src: url,
      alt: '',
      width: 0,
      height: 0,
      type: url.includes('.gif') || url.includes('sticker') ? 'sticker' : 'emoji',
      id: idFromUrl(url),
    });
  }

  // Merge: DOM first (richer data), then supplement with network-only URLs
  const merged = new Map<string, EmojiInfo>();
  for (const e of domResults) merged.set(e.src, e);
  for (const e of networkResults) {
    if (!merged.has(e.src)) merged.set(e.src, e);
  }

  return [...merged.values()];
}

export default defineContentScript({
  matches: ['*://*.douyin.com/*'],
  main() {
    setupNetworkMonitor();

    browser.runtime.onMessage.addListener((message: { type: string }, _sender) => {
      if (message.type === 'SCAN_EMOJIS') {
        const emojis = scanForEmojis();
        return Promise.resolve<ScanResponse>({ emojis });
      }
    });
  },
});
