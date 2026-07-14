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
      'sidePanel',
    ],
    host_permissions: [
      '*://*.douyin.com/*',
      '*://*.douyincdn.com/*',
      '*://*.douyinpic.com/*',
      '*://*.pstatp.com/*',
      '*://*.bytecdn.cn/*',
      '*://*.byteimg.com/*',
      '*://*.ixiguavideo.com/*',
      '*://*.toutiaoimg.com/*',
    ],
    // No default_popup — clicking the icon opens the side panel via background
    action: {},
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
