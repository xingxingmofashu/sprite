import { throttledMap } from '@/lib/utils';

export default defineBackground(() => {
  // ============ Context menu ============

  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: 'download-emoji',
      title: browser.i18n.getMessage('contextMenuTitle'),
      contexts: ['image'],
      documentUrlPatterns: ['*://*.douyin.com/*'],
    });
  });

  browser.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === 'download-emoji' && info.srcUrl) {
      browser.downloads.download({
        url: info.srcUrl,
        saveAs: true,
      }).catch((err) => {
        console.error('Download failed:', err);
      });
    }
  });

  // ============ Side panel ============

  browser.action.onClicked.addListener(async (tab) => {
    await browser.sidePanel.open({ windowId: tab.windowId });
  });

  // ============ Background message handlers ============

  browser.runtime.onMessage.addListener(async (message: {
    type: string;
    emojis?: Array<{ src: string; alt: string }>;
  }) => {
    // DOWNLOAD_SINGLE: download a single emoji image
    if (message.type === 'DOWNLOAD_SINGLE' && message.emojis?.[0]) {
      await browser.downloads.download({
        url: message.emojis[0].src,
        saveAs: true,
      });
      return { success: true };
    }

    // DOWNLOAD_ZIP: batch-download selected emojis as a ZIP archive
    if (message.type === 'DOWNLOAD_ZIP' && message.emojis && message.emojis.length > 0) {
      try {
        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();
        const folder = zip.folder('emojis');
        if (!folder) throw new Error('Failed to create folder inside ZIP');

        // Fetch images concurrently with throttledMap
        const results = await throttledMap(
          Array.from(message.emojis.entries()),
          async ([i, emoji]) => {
            try {
              const response = await fetch(emoji.src);
              if (!response.ok) throw new Error(`HTTP ${response.status}`);

              const blob = await response.blob();
              // Derive extension from Content-Type header (e.g. image/webp → webp)
              const ct = response.headers.get('Content-Type') || '';
              const ext = ct.split('/').pop()?.split(';')[0] || 'png';
              folder.file(`${i + 1}.${ext}`, blob);
              return 'ok' as const;
            } catch (err) {
              console.error(`Failed to fetch: ${emoji.src}`, err);
              return 'fail' as const;
            }
          },
          5, // concurrency
        );

        const successCount = results.filter((r) => r === 'ok').length;
        const failCount = results.filter((r) => r === 'fail').length;

        // Generate download URL — prefer blob URL, fall back to data URL
        let downloadUrl: string;
        try {
          const blob = await zip.generateAsync({ type: 'blob' });
          downloadUrl = URL.createObjectURL(blob);
        } catch {
          // Fallback for environments where createObjectURL isn't available
          const base64 = await zip.generateAsync({ type: 'base64' });
          downloadUrl = `data:application/zip;base64,${base64}`;
        }

        const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        await browser.downloads.download({
          url: downloadUrl,
          filename: `douyin-emojis/emoji-pack_${suffix}.zip`,
          saveAs: true,
        });

        if (downloadUrl.startsWith('blob:')) URL.revokeObjectURL(downloadUrl);
        return { success: true, count: successCount, failCount };
      } catch (err) {
        console.error('ZIP pack failed:', err);
        return { success: false, error: String(err) };
      }
    }

    return { success: false, error: 'Unknown message type' };
  });
});
