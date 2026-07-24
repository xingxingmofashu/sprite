import { useState, useEffect, useCallback } from 'react';
import type { ImageInfo } from '@/types';

interface UsePreviewReturn {
  previewIndex: number | null;
  previewImage: ImageInfo | null;
  openPreview: (index: number) => void;
  closePreview: () => void;
  prev: () => void;
  next: () => void;
}

export function usePreview(list: ImageInfo[]): UsePreviewReturn {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const previewImage = previewIndex !== null ? list[previewIndex] ?? null : null;

  // Reset preview if the list shrinks below the current index
  useEffect(() => {
    if (previewIndex !== null && previewIndex >= list.length) {
      setPreviewIndex(null);
    }
  }, [list.length, previewIndex]);

  const openPreview = useCallback((index: number) => setPreviewIndex(index), []);
  const closePreview = useCallback(() => setPreviewIndex(null), []);
  const prev = useCallback(() => setPreviewIndex((i) => (i !== null ? i - 1 : i)), []);
  const next = useCallback(() => setPreviewIndex((i) => (i !== null ? i + 1 : i)), []);

  return { previewIndex, previewImage, openPreview, closePreview, prev, next };
}