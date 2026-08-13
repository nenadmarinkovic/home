# Save to website — iOS

There is no extension in this folder, and that is deliberate. On iOS the share
sheet does the job an extension would, and it works from every app rather than
just the browser.

## Why not an extension

**Chrome on iOS cannot run extensions at all.** It is a WKWebView wrapper with
no extension API, so there is nothing to build against.

**Safari on iOS can**, but only as a Web Extension bundled inside a native iOS
app: a Mac, Xcode, a signed app, and either a $99/yr developer account or a
re-sideload every 7 days when a free Apple ID's provisioning profile expires.
`extensions/chrome/` would mostly convert
(`xcrun safari-web-extension-converter extensions/chrome/`), but `background.js`
is built around `chrome.contextMenus`, which iOS Safari does not implement — the
right-click-a-link-and-tag flow would not survive, only the popup. It is a lot of
ceremony for less than what a Shortcut gives you.

**A PWA share target is not an option either.** The site ships a manifest and a
service worker, but iOS Safari does not implement the Web Share Target API, so an
installed web app still cannot appear in the share sheet. That API is
Android-only.

## What to build instead

Two Shortcuts, both driven from the share sheet. Pick one — or install both and
use whichever fits the moment.

|                     | **A · Open the form** | **B · Save silently** |
| ------------------- | --------------------- | --------------------- |
| Stores your token   | no                    | yes, in the Shortcut  |
| Leaves the app      | opens Safari          | no                    |
| Edit title and note | yes                   | no                    |
| Pick tags           | yes, live from the DB | from a fixed list     |
| Summarize with AI   | yes                   | no                    |

Action names drift slightly between iOS versions; the shapes below are stable
even when the wording is not.

### A · Open the save form

Hands the URL to `/save` on the site, which renders a real form: title, note,
tag chips, a **Summarize** button that has Mistral draft a description from the
page, and a public/private toggle. Authentication is the session cookie you
already have in Safari, so there is no token in the Shortcut. If the cookie has
expired you land on the login page and get bounced back to the filled-in form.

1. New Shortcut → in its settings enable **Show in Share Sheet**, and set
   **Accepted Types** to **URLs** and **Text**.
2. **Receive URLs and Text from Share Sheet.**
3. **Get URLs from Input** — most apps hand over a URL, some a blob of text with
   the URL inside; this normalizes both. (`/save` digs a URL out of a text blob
   on its own too, so this step is belt-and-braces.)
4. **URL Encode** the result. Without it, any URL carrying its own `?` or `&`
   truncates when it becomes a query parameter.
5. **Open URLs** with a **Text** value of:

   ```
   https://YOUR-SITE/save?url=[URL Encoded Text]
   ```

   where the bracketed part is the variable from step 4.

Name it something short — the name is what you tap in the share sheet.

`/save` also accepts `title=` and `text=`, so a Safari-only variant can prefill
the title: insert **Get Details of Safari Web Page** → **Name** before step 5,
URL-encode it too, and append `&title=[…]`. That action only works when the
input really is a Safari page, so keep it out of the general-purpose Shortcut.

### B · Save without leaving the app

Posts straight to the API. No browser, no round trip — a notification confirms
it. The cost is that a long-lived token lives inside the Shortcut.

1. Generate the token: open `/admin/links` on the site → the key icon → copy.
2. New Shortcut, **Show in Share Sheet**, **Accepted Types: URLs** and **Text**.
3. **Receive URLs and Text from Share Sheet** → **Get URLs from Input**.
4. **Choose from List** with **Select Multiple** on, over a **List** action
   holding your tag slugs as plain text (`ai`, `design`, `dev`, …). Add `public`
   to that list if you want the option of publishing straight from your phone.
5. **Get Contents of URL**:
   - URL: `https://YOUR-SITE/api/links`
   - Method: **POST**
   - Headers: `Authorization` → `Bearer YOUR_TOKEN`
   - Request Body: **JSON**
     - `url` (Text) → the variable from step 3
     - `tags` (Array) → the variable from step 4
6. **Show Notification** with the result so a failure is not silent.

To pull the tag list from the database instead of hardcoding it, replace step 4
with: **Get Contents of URL** on `https://YOUR-SITE/api/tags` (no auth needed) →
**Get Dictionary Value** `tags` → **Choose from List** (Select Multiple) → then
**Repeat with Each**, taking **Get Dictionary Value** `slug` of the repeat item
and adding it to a variable. Reliable, but four extra actions and a network
round trip every save — worth it only if you add tags often.

#### Keeping the token safe

Shortcuts are not encrypted at rest the way the Keychain is, and the token is
plain text inside the Shortcut, so **never share this Shortcut** — sharing it
hands over write access to the links table. If it does leak, rotating at
`/admin/links` invalidates it immediately. Shortcut A avoids the problem
entirely by not holding a token.

## Bookmarklet

Works in Safari on both iOS and macOS, and needs no Shortcut. Save any page as a
bookmark, then edit the bookmark's address to:

```
javascript:location.href='https://YOUR-SITE/save?url='+encodeURIComponent(location.href)+'&title='+encodeURIComponent(document.title)
```

Editing a bookmark's address on iOS is fiddly, and this only covers Safari — the
Shortcut is better on a phone. On desktop it is a decent fallback in any browser
that is not Chrome or Firefox, where the real extensions in `../chrome` and
`../firefox` do more.

## Known gaps

- **No title unless the app provides one.** iOS share sheets usually pass only a
  URL, so a save from B, or from A outside Safari, lands with an empty title.
  Fixing it properly means fetching the page server-side for its `<title>` /
  `og:title` — `lib/page-text.ts` already has a redirect-following, SSRF-guarded
  fetcher to build on.
- **Summarize is browser-only.** It lives on the `/save` form, so Shortcut B
  cannot reach it.
