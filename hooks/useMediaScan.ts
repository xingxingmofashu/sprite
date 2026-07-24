import { useState, useEffect, useCallback } from 'react';
import { ScanMessage } from '@/types';
import type { ImageInfo, VideoInfo, ScanResponse } from '@/types';

type Status = 'idle' | 'scanning' | 'done' | 'error';

interface UseMediaScanReturn {
  images: ImageInfo[];
  videos: VideoInfo[];
  status: Status;
  scan: (type?: ScanMessage) => Promise<void>;
}

/**
 * Hook managing media scanning lifecycle:
 * - Scans current douyin tab for images and/or videos
 * - Defaults to scanning all media on mount
 */
export function useMediaScan(): UseMediaScanReturn {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [videos, setVideos] = useState<VideoInfo[]>([]);
  const [status, setStatus] = useState<Status>('idle');

  const scan = useCallback(async (type: ScanMessage = ScanMessage.Media) => {
    setStatus('scanning');

    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id || !tab.url?.includes('douyin.com')) {
        setStatus('error');
        return;
      }

      const response = await browser.tabs.sendMessage<{ type: ScanMessage }, ScanResponse>(tab.id, { type });

      setImages(response?.images ?? []);
      setVideos(response?.videos ?? []);
      setStatus('done');
    } catch (err) {
      console.error('Scan failed:', err);
      setStatus('error');
    }
  }, []);

  // Auto-scan all media on mount
  useEffect(() => { scan(); }, [scan]);

  return {
    images,
    videos,
    status,
    scan,
  };
}