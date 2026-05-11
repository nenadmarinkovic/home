# Save to website — Chrome extension

A small unpacked extension that saves the current page (or right-clicked link) to your personal site's `/links` collection with tags.

## Install

1. Open `chrome://extensions`.
2. Toggle **Developer mode** on.
3. Click **Load unpacked** → choose this `chrome/` folder.
4. (Optional) Pin the extension so its icon stays visible.

> **Chrome 127+ recommended.** Earlier versions can't open the toolbar popup from a context-menu click, so the extension falls back to a detached popup window (which on macOS yanks you out of full-screen). Pinning the toolbar icon is required for the in-place popup to work.

## Configure

1. Click the extension icon → **right-click → Options**, or open the puzzle-piece menu and pick **Options**.
2. Fill in:
   - **Site URL** — e.g. `http://localhost:3000` or `https://nenad.io`. No trailing slash.
   - **API token** — generate / copy from `/admin/links` on your site.
3. Hit **Save**, then **Test connection** to confirm the site responds. Use **Refresh tags** any time you add a new tag in the admin.

## Use

Two ways to save:

- **Right-click anywhere on a page** (or on a link / image) → **Save to website** → pick a tag for a one-click save, or pick **Save with tags…** which anchors the popup to the toolbar icon (no new window, stays inside your current macOS Space / full-screen).
- **Click the toolbar icon** → same form, prefilled with the current tab's URL and title.

In the popup you can type a description, or hit **Summarize** to let Mistral draft a 2–3 sentence summary from the page text (handy for sharing later on Bluesky).

A green **✓** badge flashes on the toolbar after a successful save. **✗** means it failed (check the popup for the error message, or open the options page).

## Notes

- Tags are managed on the site (`/admin/links`). The extension only reads them.
- The extension does not store any data beyond your endpoint URL and token (synced via Chrome) and a short tag cache (local).
- Use the `public` tag to expose a link on the public `/links` page. Anything else stays private.
