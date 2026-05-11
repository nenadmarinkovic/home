const urlEl = document.getElementById("url");
const titleEl = document.getElementById("title");
const tagsEl = document.getElementById("tags");
const saveBtn = document.getElementById("save");
const cancelBtn = document.getElementById("cancel");
const statusEl = document.getElementById("status");

const isWindowed =
  new URLSearchParams(location.search).get("context") === "window";

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
  if (isWindowed) {
    const { pending } = await chrome.storage.local.get("pending");
    if (pending) {
      return { url: pending.url || "", title: pending.title || "" };
    }
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
    tags: Array.from(selected),
  });
  if (resp?.ok) {
    showStatus("Saved.", "ok");
    setTimeout(() => {
      if (isWindowed) window.close();
    }, 800);
  } else {
    showStatus(resp?.error || "Save failed.", "err");
    saveBtn.disabled = false;
  }
});

cancelBtn.addEventListener("click", () => window.close());

init();
