# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
pnpm dev              # Development mode — auto-opens browser with extension loaded
pnpm build            # Production build to .output/chrome-mv3/
pnpm compile          # TypeScript type-check (tsc --noEmit)
pnpm zip              # Package extension for distribution
pnpm postinstall      # Run `wxt prepare` after dependency changes
```

## Architecture

**Framework**: [WXT](https://wxt.dev) v0.20 — Vite-based browser extension framework for Manifest V3.

**Stack**: React 19 + TypeScript + Tailwind CSS v4 (via `@tailwindcss/vite` plugin) + pnpm.

### Entrypoints (auto-discovered from `entrypoints/`)

| Entrypoint | Type | Purpose |
|---|---|---|
| `background.ts` | Service worker | Context menu, fetch proxy, ZIP download |
| `content.ts` | Content script | Emoji detection (DOM + PerformanceObserver), runs on `*.douyin.com/*` |
| `popup/` | Popup page | React app displayed when clicking extension icon |

### Auto-imported directories

Files in these directories are auto-imported by WXT (no explicit import statement needed):

- `utils/` — `useI18n()`, `useEmojiProxy()`, `types.ts` (EmojiInfo, ScanResponse), `url.ts` (getNameFromUrl, getExtension)
- `components/` — `EmojiCard`, `PopupHeader`, `PopupToolbar`, `LoadingView`, `ErrorView`, `EmptyView`

### Message flow

```
Popup (App.tsx) ──SCAN_EMOJIS──→ Content Script (content.ts)
                                  ├─ PerformanceObserver captures live network img requests
                                  ├─ scanDom() scans <img> elements
                                  └─ merges both, deduped by URL

Popup ──PROXY_IMAGE──→ Background ──fetch()──→ CDN ──base64 dataUrl──→ Popup <img>
       ──DOWNLOAD_ZIP──→ Background ──fetch each + JSZip──→ download .zip
       ──DOWNLOAD_SINGLE──→ Background ──browser.downloads──→ single image
```

### Emoji detection strategy

Two parallel data sources merged on each scan:

1. **PerformanceObserver** (real-time): Captures every `<img>` network request as it loads (same entries as DevTools Network tab). Provides URLs only, no dimensions.
2. **DOM scan** (fallback): Iterates `document.querySelectorAll('img')` for CDN-hosted images. Provides dimensions + alt text.

DOM results take priority (richer data); network-only URLs supplement the list. Deduped by `src`.

### Image display

CDN images are loaded via `crossOrigin="anonymous"` which causes CORS errors. Solution: the background service worker fetches images (using `host_permissions` to bypass CORS), converts to base64 data URLs, and returns them to the popup. Proxying runs concurrently (limit: 5) and skips images >700KB to stay under Chrome's ~1MB `sendMessage` limit.

### i18n

Uses `browser.i18n.getMessage()` via the `useI18n()` hook. Locale files in `public/_locales/{en,zh_CN}/messages.json`. Manifest fields use `__MSG_` syntax.
