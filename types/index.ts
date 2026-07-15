export interface EmojiInfo {
  src: string;
  alt: string;
  width: number;
  height: number;
  id: string;
}

export interface ScanResponse {
  emojis: EmojiInfo[];
}
