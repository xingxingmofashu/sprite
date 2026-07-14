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
 * 扫描抖音页面中的表情包图片
 */
function scanForEmojis(): EmojiInfo[] {
  const emojis: EmojiInfo[] = [];
  const seen = new Set<string>();
  let index = 0;

  const images = document.querySelectorAll('img');

  images.forEach((img) => {
    const src = img.currentSrc || img.src || '';
    const alt = (img.alt || '').trim();
    const width = img.naturalWidth || img.width || 0;
    const height = img.naturalHeight || img.height || 0;

    if (!src || seen.has(src)) return;
    if (src.startsWith('data:')) return;
    if (width === 0 && height === 0) return;

    // 抖音 CDN 域名检测
    const isDouyinCDN = /douyincdn|pstatp|bytecdn|toutiaoimg|ixiguavideo/.test(src);

    // 类名检测
    const emojiClassPattern = /emoji|sticker|face|biaoqing|表情|sticker_img/i;
    const hasEmojiClass = emojiClassPattern.test(img.className);

    // alt 文字检测
    const emojiAltPattern = /emoji|sticker|face|表情|动图|gif/i;
    const hasEmojiAlt = emojiAltPattern.test(alt);

    // 父容器检测
    const hasEmojiParent = !!img.closest(
      '[class*="emoji"],[class*="sticker"],[class*="表情"],[class*="chat"]' +
      ',[class*="message"],[class*="msg"],[class*="face"],[class*="sticker"]',
    );

    // 尺寸检测（表情包通常较小）
    const isSmall = width > 0 && width <= 300 && height > 0 && height <= 300;

    // 综合判断
    const isLikelyEmoji = isDouyinCDN || hasEmojiClass || hasEmojiAlt || hasEmojiParent;

    // 如果是抖音 CDN 的图片且尺寸不大，大概率是表情包
    // 或者带有明显的表情包特征
    if (isLikelyEmoji && isSmall) {
      seen.add(src);
      const isSticker = width > 100 || height > 100 || src.includes('.gif') || src.includes('sticker');
      emojis.push({
        src,
        alt: alt || '表情包',
        width,
        height,
        type: isSticker ? 'sticker' : 'emoji',
        id: `emoji-${index++}`,
      });
    }
  });

  return emojis;
}

export default defineContentScript({
  matches: ['*://*.douyin.com/*'],
  main() {
    // 监听来自 popup 的扫描请求
    browser.runtime.onMessage.addListener((message: { type: string }, _sender) => {
      if (message.type === 'SCAN_EMOJIS') {
        const emojis = scanForEmojis();
        return Promise.resolve<ScanResponse>({ emojis });
      }
    });
  },
});
