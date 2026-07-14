const VALID_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'];

/**
 * 从 URL 路径中提取文件名（不含扩展名）
 */
export function getNameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const basename = u.pathname.split('/').pop() || 'emoji';
    return basename.replace(/\.[^.]+$/, '');
  } catch {
    return `emoji_${Date.now()}`;
  }
}

/**
 * 从 URL 路径中提取文件扩展名
 */
export function getExtension(url: string): string {
  try {
    const u = new URL(url);
    const ext = u.pathname.split('.').pop() || '';
    return VALID_EXTENSIONS.includes(ext.toLowerCase()) ? ext : 'png';
  } catch {
    return 'png';
  }
}
