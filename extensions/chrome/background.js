const ROOT_ID = "save-root";
const CUSTOM_ID = "save-custom";
const TAG_PREFIX = "save-tag-";
const CONTEXTS = ["page", "link", "selection", "image", "video"];
const TAGS_TTL_MS = 30 * 60 * 1000;

async function getConfig() {
  const { endpoint, token } = await chrome.storage.sync.get([
    "endpoint",
    "token",
  ]);
  return {
    endpoint: typeof endpoint === "string" ? endpoint.replace(/\/$/, "") : "",
    token: typeof token === "string" ? token : "",
  };
}

async function fetchTags() {
  const { endpoint } = await getConfig();
  if (!endpoint) return [];
  try {
    const res = await fetch(`${endpoint}/api/tags`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.tags) ? data.tags : [];
  } catch {
    return [];
  }
}

function tagsEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length)
    return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i]?.slug !== b[i]?.slug || a[i]?.name !== b[i]?.name) return false;
  }
  return true;
}

async function getLiveTags() {
  const fresh = await fetchTags();
  const { tagsCache } = await chrome.storage.local.get(["tagsCache"]);
  await chrome.storage.local.set({
    tagsCache: fresh,
    tagsCacheAt: Date.now(),
  });
  // If the list changed since the menu was built, rebuild it so the
  // context menu stays in sync without requiring an extension restart.
  if (!tagsEqual(fresh, tagsCache)) {
    rebuildMenu(fresh).catch(() => {});
  }
  return fresh;
}

async function getCachedTagsForFallback() {
  const { tagsCache, tagsCacheAt } = await chrome.storage.local.get([
    "tagsCache",
    "tagsCacheAt",
  ]);
  if (
    Array.isArray(tagsCache) &&
    typeof tagsCacheAt === "number" &&
    Date.now() - tagsCacheAt < TAGS_TTL_MS
  ) {
    return tagsCache;
  }
  return null;
}

async function rebuildMenu(prefetchedTags) {
  await chrome.contextMenus.removeAll();
  const tags = Array.isArray(prefetchedTags) ? prefetchedTags : await fetchTags();
  await chrome.storage.local.set({ tagsCache: tags, tagsCacheAt: Date.now() });

  chrome.contextMenus.create({
    id: ROOT_ID,
    title: "Save to website",
    contexts: CONTEXTS,
  });
  chrome.contextMenus.create({
    id: CUSTOM_ID,
    parentId: ROOT_ID,
    title: "Save with tags…",
    contexts: CONTEXTS,
  });
  if (tags.length > 0) {
    chrome.contextMenus.create({
      id: "save-sep",
      parentId: ROOT_ID,
      type: "separator",
      contexts: CONTEXTS,
    });
    for (const tag of tags) {
      chrome.contextMenus.create({
        id: TAG_PREFIX + tag.slug,
        parentId: ROOT_ID,
        title: tag.name,
        contexts: CONTEXTS,
      });
    }
  }
}

async function extractActiveTabText() {
  try {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const tab = tabs[0];
    if (!tab?.id) return "";
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const root = document.querySelector("article, main") || document.body;
        const text = root?.innerText || document.body?.innerText || "";
        return text.slice(0, 16000);
      },
    });
    const result = Array.isArray(results) ? results[0]?.result : null;
    return typeof result === "string" ? result : "";
  } catch {
    return "";
  }
}

async function summarizeUrl({ url }) {
  const { endpoint, token } = await getConfig();
  if (!endpoint || !token) {
    return { ok: false, error: "Missing endpoint or token in options" };
  }
  const text = await extractActiveTabText();
  try {
    const res = await fetch(`${endpoint}/api/links/summarize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, text }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || typeof data.summary !== "string") {
      return { ok: false, error: data.error ?? `HTTP ${res.status}` };
    }
    return { ok: true, summary: data.summary };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

async function saveLink({ url, title, note, tagSlugs }) {
  const { endpoint, token } = await getConfig();
  if (!endpoint || !token) {
    flashBadge("?", "#a3a3a3");
    return { ok: false, error: "Missing endpoint or token in options" };
  }
  try {
    const res = await fetch(`${endpoint}/api/links`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, title, note, tags: tagSlugs }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      flashBadge("✗", "#dc2626");
      return { ok: false, error: data.error ?? `HTTP ${res.status}` };
    }
    flashBadge("✓", "#16a34a");
    return { ok: true };
  } catch (err) {
    flashBadge("✗", "#dc2626");
    return { ok: false, error: String(err) };
  }
}

function flashBadge(text, color) {
  chrome.action.setBadgeBackgroundColor({ color });
  chrome.action.setBadgeText({ text });
  setTimeout(() => chrome.action.setBadgeText({ text: "" }), 2500);
}

async function openCustomPopup() {
  // Prefer the toolbar action popup so we stay inside the current macOS Space
  // (full-screen window). Falls back to a separate browser popup window if the
  // browser can't open it (older Firefox, no user gesture, etc.).
  if (chrome.action && typeof chrome.action.openPopup === "function") {
    try {
      await chrome.action.openPopup();
      return;
    } catch {
      // fall through
    }
  }
  chrome.windows.create({
    url: chrome.runtime.getURL("popup.html?context=window"),
    type: "popup",
    width: 380,
    height: 540,
  });
}

chrome.runtime.onInstalled.addListener(() => {
  rebuildMenu();
});
chrome.runtime.onStartup.addListener(() => {
  rebuildMenu();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && (changes.endpoint || changes.token)) {
    rebuildMenu();
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const url = info.linkUrl || info.pageUrl || tab?.url;
  const title = tab?.title || "";
  if (!url) return;

  if (info.menuItemId === CUSTOM_ID) {
    await chrome.storage.local.set({
      pending: { url, title, savedAt: Date.now() },
    });
    await openCustomPopup();
    return;
  }
  if (
    typeof info.menuItemId === "string" &&
    info.menuItemId.startsWith(TAG_PREFIX)
  ) {
    const slug = info.menuItemId.slice(TAG_PREFIX.length);
    await saveLink({ url, title, tagSlugs: [slug] });
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "save") {
    saveLink({
      url: msg.url,
      title: msg.title,
      note: typeof msg.note === "string" ? msg.note : "",
      tagSlugs: Array.isArray(msg.tags) ? msg.tags : [],
    }).then(sendResponse);
    return true;
  }
  if (msg?.type === "refreshTags") {
    rebuildMenu().then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg?.type === "getTags") {
    (async () => {
      try {
        const tags = await getLiveTags();
        sendResponse({ tags });
      } catch {
        const cached = await getCachedTagsForFallback();
        sendResponse({ tags: cached ?? [] });
      }
    })();
    return true;
  }
  if (msg?.type === "summarize") {
    summarizeUrl({ url: msg.url }).then(sendResponse);
    return true;
  }
  return false;
});
