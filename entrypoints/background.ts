/** Max blob size for PROXY_IMAGE (~700KB — base64 is ~930KB, safely under Chrome's 1MB message limit) */
const MAX_PROXY_BLOB_SIZE = 700_000;

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
      const ext = getExtension(info.srcUrl);
      const name = getNameFromUrl(info.srcUrl);
      const filename = `douyin-emojis/${name}.${ext}`;

      browser.downloads.download({
        url: info.srcUrl,
        filename,
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
    url?: string;
    emojis?: Array<{ src: string; alt: string }>;
  }) => {
    // PROXY_IMAGE: background fetches the image (using host_permissions to bypass CORS)
    // and returns it as a base64 data URL for the side panel to display.
    if (message.type === 'PROXY_IMAGE' && message.url) {
      try {
        const response = await fetch(message.url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        // Skip oversized images to avoid exceeding Chrome's ~1MB message limit
        const contentLength = response.headers.get('Content-Length');
        if (contentLength && Number(contentLength) > MAX_PROXY_BLOB_SIZE) {
          return { error: `Image too large (${contentLength} bytes)` };
        }

        const blob = await response.blob();
        if (blob.size > MAX_PROXY_BLOB_SIZE) {
          return { error: `Image too large (${blob.size} bytes)` };
        }

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

    // DOWNLOAD_SINGLE: download a single emoji image
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

    // DOWNLOAD_ZIP: batch-download selected emojis as a ZIP archive
    if (message.type === 'DOWNLOAD_ZIP' && message.emojis && message.emojis.length > 0) {
      try {
        const { default: JSZip } = await import('jszip');
        const zip = new JSZip();
        const folder = zip.folder('emojis');
        if (!folder) throw new Error('Failed to create folder inside ZIP');

        // Fetch images concurrently with throttledMap
        const results = await throttledMap(
          message.emojis.entries(),
          async ([i, emoji]) => {
            try {
              const response = await fetch(emoji.src);
              if (!response.ok) throw new Error(`HTTP ${response.status}`);

              const blob = await response.blob();
              const ext = getExtension(emoji.src);
              const name = getNameFromUrl(emoji.src);
              folder.file(`${i + 1}_${name}.${ext}`, blob);
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
