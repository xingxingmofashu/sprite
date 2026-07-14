import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'en',
    permissions: [
      'contextMenus',
      'downloads',
    ],
    host_permissions: [
      '*://*.douyin.com/*',
      '*://*.douyincdn.com/*',
      '*://*.pstatp.com/*',
      '*://*.bytecdn.cn/*',
      '*://*.byteimg.com/*',
      '*://*.ixiguavideo.com/*',
      '*://*.toutiaoimg.com/*',
    ],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
