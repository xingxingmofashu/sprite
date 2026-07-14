/**
 * 从 URL 中提取文件名（不含扩展名）
 */
function getNameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const pathname = u.pathname;
    // 取最后一段路径，去掉扩展名
    const basename = pathname.split('/').pop() || 'emoji';
    return basename.replace(/\.[^.]+$/, '');
  } catch {
    return `emoji_${Date.now()}`;
  }
}

/**
 * 从 URL 中提取扩展名
 */
function getExtension(url: string): string {
  try {
    const u = new URL(url);
    const pathname = u.pathname;
    const ext = pathname.split('.').pop() || '';
    const validExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'];
    return validExts.includes(ext.toLowerCase()) ? ext : 'png';
  } catch {
    return 'png';
  }
}

/**
 * 判断 URL 是否看起来像表情包图片
 */
function isLikelyEmojiUrl(url: string): boolean {
  return /douyincdn|pstatp|bytecdn|toutiaoimg|emoji|sticker|表情/.test(url);
}

export default defineBackground(() => {
  // ============ 右键菜单 ============

  browser.runtime.onInstalled.addListener(() => {
    // 创建右键菜单：仅在抖音页面图片上显示
    browser.contextMenus.create({
      id: 'download-emoji',
      title: browser.i18n.getMessage('contextMenuTitle'),
      contexts: ['image'],
      documentUrlPatterns: ['*://*.douyin.com/*'],
    });
  });

  // 处理右键菜单点击
  browser.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === 'download-emoji' && info.srcUrl) {
      const ext = getExtension(info.srcUrl);
      const name = getNameFromUrl(info.srcUrl);
      const filename = `douyin-emojis/${name}.${ext}`;

      browser.downloads.download({
        url: info.srcUrl,
        filename,
        saveAs: true,
      }).catch((err) => {
        console.error('下载失败:', err);
      });
    }
  });

  // ============ 批量下载 ZIP ============

  browser.runtime.onMessage.addListener(async (message: {
    type: string;
    url?: string;
    emojis?: Array<{ src: string; alt: string }>;
  }) => {
    // 图片代理：background 通过 host_permissions 跨域 fetch，转 data URL 返回
    if (message.type === 'PROXY_IMAGE' && message.url) {
      try {
        const response = await fetch(message.url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        return { dataUrl };
      } catch (err) {
        return { error: String(err) };
      }
    }
    // 单个下载
    if (message.type === 'DOWNLOAD_SINGLE' && message.emojis?.[0]) {
      const emoji = message.emojis[0];
      const ext = getExtension(emoji.src);
      const name = getNameFromUrl(emoji.src);
      const filename = `douyin-emojis/${name}.${ext}`;

      await browser.downloads.download({
        url: emoji.src,
        filename,
        saveAs: true,
      });
      return { success: true };
    }

    // ZIP 批量下载
    if (message.type === 'DOWNLOAD_ZIP' && message.emojis && message.emojis.length > 0) {
      try {
        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();
        const folder = zip.folder('表情包');

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < message.emojis.length; i++) {
          const emoji = message.emojis[i];
          try {
            const response = await fetch(emoji.src);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const blob = await response.blob();
            const ext = getExtension(emoji.src);
            const name = getNameFromUrl(emoji.src);
            // 避免重名
            const filename = `${i + 1}_${name}.${ext}`;

            folder?.file(filename, blob);
            successCount++;
          } catch (err) {
            console.error(`下载失败: ${emoji.src}`, err);
            failCount++;
          }
        }

        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);

        await browser.downloads.download({
          url,
          filename: `douyin-emojis/表情包合集_${Date.now()}.zip`,
          saveAs: true,
        });

        URL.revokeObjectURL(url);
        return { success: true, count: successCount, failCount };
      } catch (err) {
        console.error('ZIP 打包失败:', err);
        return { success: false, error: String(err) };
      }
    }

    return { success: false, error: '未知消息类型' };
  });
});
