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
}
