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
