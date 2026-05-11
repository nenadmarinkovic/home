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

async function getCachedTags() {
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
  const tags = await fetchTags();
  await chrome.storage.local.set({ tagsCache: tags, tagsCacheAt: Date.now() });
  return tags;
}

async function rebuildMenu() {
  await chrome.contextMenus.removeAll();
  const tags = await fetchTags();
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

async function saveLink({ url, title, tagSlugs }) {
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
      body: JSON.stringify({ url, title, tags: tagSlugs }),
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

function openCustomPopup() {
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
    openCustomPopup();
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
      tagSlugs: Array.isArray(msg.tags) ? msg.tags : [],
    }).then(sendResponse);
    return true;
  }
  if (msg?.type === "refreshTags") {
    rebuildMenu().then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg?.type === "getTags") {
    getCachedTags().then((tags) => sendResponse({ tags }));
    return true;
  }
  return false;
});
