import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: '抖音表情包下载器',
    description: '一键下载抖音聊天中的表情包，支持右键菜单和批量打包',
    permissions: [
      'contextMenus',
      'downloads',
    ],
    host_permissions: [
      '*://*.douyin.com/*',
      '*://*.douyincdn.com/*',
      '*://*.pstatp.com/*',
      '*://*.bytecdn.cn/*',
      '*://*.toutiaoimg.com/*',
    ],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
