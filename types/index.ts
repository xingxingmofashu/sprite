/** Messages handled by the content script (DOM scanning) */
export enum ScanMessage {
  Media = 'SCAN_MEDIA',
  Images = 'SCAN_IMAGES',
  Videos = 'SCAN_VIDEOS',
}

/** Messages handled by the background service worker (downloads) */
export enum DownloadMessage {
  Single = 'DOWNLOAD_SINGLE',
  Zip = 'DOWNLOAD_ZIP',
  // Video = 'DOWNLOAD_VIDEO',
}

export type ImageKind = 'emoji' | 'avatar' | 'other';

export interface ImageInfo {
  src: string;
  alt: string;
  width: number;
  height: number;
  id: string;
  kind: ImageKind;
}

export interface ScanResponse {
  images: ImageInfo[];
  videos: VideoInfo[];
}

export type VideoKind = 'video' | 'other';

export interface VideoInfo {
  src: string;
  poster: string;
  width: number;
  height: number;
  id: string;
  kind: VideoKind;
}
