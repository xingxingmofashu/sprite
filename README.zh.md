<h1 align="center">Sprite</h1>

<p align="center">一款 Chrome/Edge 浏览器扩展，用于从抖音网页版聊天中下载表情包和贴图。通过侧边面板浏览、预览、批量选择并打包下载。</p>

<p align="center">
  <a href="https://github.com/xingxingmofashu/sprite/releases"><img alt="Release" src="https://img.shields.io/github/v/release/xingxingmofashu/sprite?style=flat-square" /></a>
  <a href="https://github.com/xingxingmofashu/sprite/actions/workflows/ci.yml"><img alt="CI status" src="https://img.shields.io/github/actions/workflow/status/xingxingmofashu/sprite/ci.yml?style=flat-square&branch=main" /></a>
  <a href="https://github.com/xingxingmofashu/sprite/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/xingxingmofashu/sprite?style=flat-square" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a>
</p>

## 功能

- **侧边面板浏览** — 点击扩展图标打开侧边面板，展示当前聊天中所有表情包和贴图
- **网格预览** — 响应式网格布局浏览图片；点击放大按钮可全屏预览，支持键盘左右切换
- **批量 Zip 下载** — 勾选多个表情包后一键打包下载为 ZIP
- **单张下载** — 卡片底部一键下载单张表情包
- **右键菜单** — 在抖音页面右键图片即可快速下载
- **国际化** — 支持英文和简体中文

## 安装

### 从源码构建

```sh
pnpm install
pnpm build
```

然后加载 `.output/chrome-mv3/` 目录下的解压扩展：
1. 打开 Chrome，访问 `chrome://extensions`
2. 开启 **开发者模式**
3. 点击 **加载已解压的扩展程序**，选择 `.output/chrome-mv3/` 文件夹

### 开发

```sh
pnpm dev        # 启动开发服务器（热更新）
pnpm compile    # TypeScript 类型检查
```

## 工作原理

Sprite 扫描抖音聊天页面的 DOM，从已知 CDN 域名中提取表情包/贴图的图片地址。图片通过后台 Service Worker 代理请求（利用 `host_permissions` 绕过 CORS），转为 base64 数据后在侧边面板显示。

| 入口 | 作用 |
|---|---|
| `sidepanel/` | 主界面 — 包含表情网格、工具栏和预览弹窗的 React 应用 |
| `background.ts` | Service Worker — 右键菜单、图片代理、ZIP 下载 |
| `content.ts` | 内容脚本 — 在 `*.douyin.com/*` 页面进行 DOM 扫描 |

## 技术栈

- **WXT** v0.20 — 基于 Vite 的浏览器扩展框架
- **React** 19 + TypeScript
- **Tailwind CSS** v4 + shadcn/ui (Card, Dialog, Empty, Button, Checkbox)
- **JSZip** — 客户端 ZIP 打包
- **Lucide** — 图标库

## 许可证

MIT
