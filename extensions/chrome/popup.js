const urlEl = document.getElementById("url");
const titleEl = document.getElementById("title");
const descriptionEl = document.getElementById("description");
const tagsEl = document.getElementById("tags");
const saveBtn = document.getElementById("save");
const cancelBtn = document.getElementById("cancel");
const summarizeBtn = document.getElementById("summarize");
const summarizeLabel = document.getElementById("summarize-label");
const statusEl = document.getElementById("status");

const isWindowed =
  new URLSearchParams(location.search).get("context") === "window";

const PENDING_FRESH_MS = 10_000;
let usedPending = false;

let selected = new Set();

function showStatus(message, kind) {
  statusEl.textContent = message;
  statusEl.className = "status" + (kind ? ` ${kind}` : "");
}

async function loadCurrentTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  return tab ? { url: tab.url || "", title: tab.title || "" } : { url: "", title: "" };
}

async function loadInitial() {
  const { pending } = await chrome.storage.local.get("pending");
  const fresh =
    pending &&
    typeof pending.savedAt === "number" &&
    Date.now() - pending.savedAt < PENDING_FRESH_MS;
  if (fresh) {
    usedPending = true;
    return { url: pending.url || "", title: pending.title || "" };
  }
  return loadCurrentTab();
}

function renderTags(tags) {
  tagsEl.innerHTML = "";
  if (tags.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No tags yet. Create them on the admin page.";
    tagsEl.appendChild(empty);
    return;
  }
  for (const tag of tags) {
    const el = document.createElement("span");
    el.className = "tag";
    el.textContent = tag.name;
    el.dataset.slug = tag.slug;
    el.addEventListener("click", () => {
      if (selected.has(tag.slug)) {
        selected.delete(tag.slug);
        el.classList.remove("active");
      } else {
        selected.add(tag.slug);
        el.classList.add("active");
      }
    });
    tagsEl.appendChild(el);
  }
}

async function init() {
  const { url, title } = await loadInitial();
  urlEl.textContent = url || "—";
  titleEl.value = title;
  saveBtn.disabled = !url;

  const tagsResp = await chrome.runtime.sendMessage({ type: "getTags" });
  renderTags(Array.isArray(tagsResp?.tags) ? tagsResp.tags : []);
}

saveBtn.addEventListener("click", async () => {
  const url = urlEl.textContent;
  if (!url) return;
  saveBtn.disabled = true;
  showStatus("Saving…", "");
  const resp = await chrome.runtime.sendMessage({
    type: "save",
    url,
    title: titleEl.value.trim(),
    note: descriptionEl.value.trim(),
    tags: Array.from(selected),
  });
  if (resp?.ok) {
    showStatus("Saved.", "ok");
    if (usedPending) {
      chrome.storage.local.remove("pending");
    }
    setTimeout(() => window.close(), 800);
  } else {
    showStatus(resp?.error || "Save failed.", "err");
    saveBtn.disabled = false;
  }
});

cancelBtn.addEventListener("click", () => window.close());

summarizeBtn.addEventListener("click", async () => {
  const url = urlEl.textContent;
  if (!url) return;
  summarizeBtn.disabled = true;
  summarizeLabel.textContent = "Summarizing…";
  showStatus("", "");
  const resp = await chrome.runtime.sendMessage({ type: "summarize", url });
  if (resp?.ok && typeof resp.summary === "string") {
    descriptionEl.value = resp.summary;
  } else {
    showStatus(resp?.error || "Summarize failed.", "err");
  }
  summarizeBtn.disabled = false;
  summarizeLabel.textContent = "Summarize";
});

init();
