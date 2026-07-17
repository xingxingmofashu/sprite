# Changelog

## v0.1.0 (2026-07-17)

### Features
- Scan and display emoji/sticker images from Douyin web chat
- Grid view with shadcn Attachment component for image display
- Image preview modal with keyboard navigation (ArrowLeft/ArrowRight)
- Single image download via browser.downloads API
- Batch ZIP download for selected images
- Right-click context menu for quick download
- i18n support (English, Simplified Chinese)

### Changes
- Replace custom UI components with shadcn/ui (Dialog, Button, Attachment, Empty)
- Migrate from @radix-ui to @base-ui/react for Dialog primitives
- Remove image proxy pipeline — CDN images load directly
- Remove artificial emoji/sticker type distinction
- Rename EmojiCard → ImageCard, useEmojiScanner → useImageScanner
- Use Douyin red (#fe2c55) as primary accent color
- Add CI workflow (TypeScript type-check on PRs)
- Add release workflow (Chrome + Firefox packaging)

### Fixes
- Add img onError handler with fallback UI in preview modal
- Add error boundary to prevent side panel crashes
- Restore filename display in preview modal footer
- Add try-catch error isolation around keyboard/callback handlers
- Fix index bounds race condition in preview navigation
- Surface download failures to user via alert
- Fix Firefox zip warnings (gecko ID, data collection consent)
- Fix pnpm build script approval in CI

---

Notable conventions:
- Versions follow [Semantic Versioning](https://semver.org/).
- Entries use the format: `- Description.` under each category.
