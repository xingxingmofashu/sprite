# Sprite

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
| `background.ts` | Service worker | Context menu, ZIP download |
| `content.ts` | Content script | DOM emoji scanning, runs on `*.douyin.com/*` |
| `sidepanel/` | Side panel page | React app displayed when clicking extension icon |

### Auto-imported directories

Files in these directories are auto-imported by WXT (no explicit import statement needed):

- `types/` — `ImageInfo`, `ImageKind`, `ScanResponse`
- `utils/` — `useI18n()`, `useImageScanner()`, `async.ts` (throttledMap)
- `components/` — `ImageCard`, `SidePanelHeader`, `SidePanelToolbar`, `FilterBar`, `PreviewModal`, `LoadingView`, `EmptyView`

### Message flow

```
  Side Panel (App.tsx) ──SCAN_IMAGES──→ Content Script (content.ts)
                                          └─ querySelectorAll('img'), filter by CDN domain, classify by kind

  Side Panel ──DOWNLOAD_ZIP──→ Background ──fetch each + JSZip──→ download .zip
              ──DOWNLOAD_SINGLE──→ Background ──browser.downloads──→ single image
```

### Image detection & classification

On `SCAN_IMAGES` message, the content script iterates `document.querySelectorAll('img')`, filters by CDN domain regex, deduplicates by URL, and classifies each image into a `kind`:

- `emoji` — `img.className` contains `MessageItemEmojiimage` (case-insensitive)
- `avatar` — `img.className` contains `commonConversationIconnoDrag` OR URL contains `sc=avatar`
- `other` — everything else

Uses the URL hash as a stable React key (`idFromUrl`). The side panel `FilterBar` lets users filter the grid by `kind`.

### Image display

Douyin CDN images load directly as `<img src>` without CORS restrictions — the CDN domains are in `host_permissions`. No proxy or base64 conversion needed.

### i18n

Uses `browser.i18n.getMessage()` via the `useI18n()` hook. Locale files in `public/_locales/{en,zh_CN}/messages.json`. Manifest fields use `__MSG_` syntax.
