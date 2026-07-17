import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  suppressWarnings: {
    firefoxDataCollection: true,
  },
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
    icons: {
      16: '/icon.png'
    },
    browser_specific_settings: {
      gecko: { id: 'sprite@xingxingmofashu.github.io' },
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
