# Website Harness cutover

One-time steps to stop pasting embed HTML into WordPress.

## 1. Install the updated plugin

```bash
npm run plugin:zip
```

Upload `ultra-card-integration.zip` in WP Admin → Plugins.

## 2. Configure the harness

Open **Ultra Card → Website**. Confirm channel is `main`, copy the flush secret into the GitHub Actions secret `UC_HARNESS_SECRET`, and click **Test** on each page row.

## 3. Replace pasted HTML with shortcodes

On each live page, remove the old Raw HTML block and add a **WPBakery Text Block** containing exactly one of:

```
[ultra_card_page id="modules"]
[ultra_card_page id="template-mode"]
[ultra_card_page id="presets"]
```

Do **not** use a Raw HTML element — it base64-encodes content and does not expand shortcodes.

| Page | Shortcode | Path |
|------|-----------|------|
| Modules | `[ultra_card_page id="modules"]` | `/modules/` |
| Template Mode | `[ultra_card_page id="template-mode"]` | `/template-mode/` |
| Presets | `[ultra_card_page id="presets"]` (or keep the native archive) | `/presets/` |

## 4. Verify

After saving, view the page source and confirm an `<!-- ultra_card_page id=… sha=… -->` comment appears. Hard-refresh; module counts and template scopes should match the latest `main` demo bundle.

From then on, pushing to `main` rebuilds the demo bundle / fragment manifest and the CI flush webhook refreshes the live site automatically.
