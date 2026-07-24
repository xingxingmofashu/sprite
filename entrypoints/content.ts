import hash from '@emotion/hash';
import { ScanMessage } from '@/types';
import type { ImageInfo, ImageKind, ScanResponse, VideoInfo } from '@/types';

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
function scanImages(): ImageInfo[] {
  const results: ImageInfo[] = [];
  const seen = new Set<string>();
  const images = document.querySelectorAll('img');

  images.forEach((img) => {
    const src = img.currentSrc || img.src || '';
    if (!src || src.startsWith('data:') || src.startsWith('blob:') || seen.has(src)) return;
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

/** Scan DOM <video> elements for CDN-hosted videos */
function scanVideos(): VideoInfo[] {
  const results: VideoInfo[] = [];
  const seen = new Set<string>();
  const videos = document.querySelectorAll('video');

  videos.forEach((video) => {
    // src may be on the <video> itself, a <source> child, or currentSrc (mirrors selected source)
    const source = video.querySelector('source');
    const src = source?.src || video.currentSrc || video.src || '';
    if (!src || src.startsWith('data:') || src.startsWith('blob:') || seen.has(src)) return;
    seen.add(src);

    const width = video.videoWidth || video.width || 0;
    const height = video.videoHeight || video.height || 0;

    results.push({
      src,
      poster: video.poster || '',
      width,
      height,
      id: hash(src),
      kind: 'video',
    });
  });

  return results;
}

export default defineContentScript({
  matches: ['*://*.douyin.com/*'],
  main() {
    browser.runtime.onMessage.addListener((message: { type: ScanMessage }, _sender) => {
      if (message.type === ScanMessage.Media) {
        return Promise.resolve<ScanResponse>({
          images: scanImages(),
          videos: scanVideos(),
        });
      }
      if (message.type === ScanMessage.Images) {
        return Promise.resolve<ScanResponse>({ images: scanImages(), videos: [] });
      }
      if (message.type === ScanMessage.Videos) {
        return Promise.resolve<ScanResponse>({ images: [], videos: scanVideos() });
      }
    });
  },
});