# Save to website — Firefox extension

A small unpacked extension that saves the current page (or right-clicked link) to your personal site's `/links` collection with tags. Firefox port of the Chrome extension — same UI and behaviour, with a Gecko-friendly manifest.

## Install (temporary, for development)

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**.
3. Pick `manifest.json` inside this `firefox-extension/` folder.
4. (Optional) Right-click the toolbar → **Customize Toolbar…** to pin the icon if Firefox tucked it into the overflow menu.

Temporary installs disappear when Firefox restarts. For a persistent install you'd need to package + sign through addons.mozilla.org or use the `Developer Edition` / `Nightly` channels with `xpinstall.signatures.required` disabled.

## Configure

1. Click the toolbar icon, or open `about:addons` → find **Save to website** → ⋯ → **Options**.
2. Fill in:
   - **Site URL** — e.g. `http://localhost:3000` or `https://nenad.io`. No trailing slash.
   - **API token** — generate / copy from `/admin/links` on your site.
3. Hit **Save**, then **Test connection**. Use **Refresh tags** after creating a new tag in admin.

## Use

- **Right-click anywhere on a page** (or on a link / image) → **Save to website** → pick a tag for a one-click save, or **Save with tags…** to pick multiple in a small popup window.
- **Click the toolbar icon** → same form, prefilled with the current tab's URL and title.

A green **✓** badge flashes on the toolbar after success. **✗** means failure (check the popup for the error, or open Options).

## Differences from the Chrome build

- `background.scripts` (event page) instead of `service_worker` — broader Firefox compatibility (works back to 109).
- `options_ui` with `open_in_tab: true` instead of `options_page` — Firefox's preferred form.
- `browser_specific_settings.gecko` is required: a stable add-on `id` plus `strict_min_version: "115.0"`.

The JS code is unchanged — Firefox accepts the `chrome.*` API namespace under MV3.

## Notes

- Tags are managed on the site (`/admin/links`). The extension only reads them.
- The extension stores only your endpoint URL and token (synced via Firefox account if you're signed in) and a short tag cache (local).
- Use the `public` tag to expose a link on the public `/links` page. Anything else stays private.
