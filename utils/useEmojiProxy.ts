import { useState, useEffect, useRef } from 'react';
import type { EmojiInfo } from '@/utils/types';
import { throttledMap } from '@/utils/async';

/** Maximum concurrent PROXY_IMAGE requests to background */
const PROXY_CONCURRENCY = 5;

/**
 * Proxy emoji images through the background service worker to bypass
 * CDN CORS restrictions. Returns a map of src → dataUrl.
 */
export function useEmojiProxy(emojis: EmojiInfo[]): Record<string, string> {
  const [proxiedUrls, setProxiedUrls] = useState<Record<string, string>>({});
  const proxiedRef = useRef<Set<string> | null>(null);

  const getProxied = (): Set<string> => {
    if (!proxiedRef.current) proxiedRef.current = new Set();
    return proxiedRef.current;
  };

  useEffect(() => {
    if (emojis.length === 0) return;
    let cancelled = false;
    const proxied = getProxied();

    const urlsToProxy = emojis
      .map((e) => e.src)
      .filter((src) => !proxied.has(src));

    if (urlsToProxy.length === 0) return;

    throttledMap(
      urlsToProxy,
      async (src) => {
        try {
          const result = await browser.runtime.sendMessage({ type: 'PROXY_IMAGE', url: src });
          if (result?.dataUrl) {
            proxied.add(src);
            return { src, dataUrl: result.dataUrl };
          }
        } catch { /* ignore */ }
        return null;
      },
      PROXY_CONCURRENCY,
    ).then((results) => {
      if (cancelled) return;
      const entries = results.filter(Boolean) as Array<{ src: string; dataUrl: string }>;
      if (entries.length > 0) {
        setProxiedUrls((prev) => {
          const next = { ...prev };
          for (const e of entries) next[e.src] = e.dataUrl;
          return next;
        });
      }
    });

    return () => { cancelled = true; };
  }, [emojis]);

  return proxiedUrls;
}
