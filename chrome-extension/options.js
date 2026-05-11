const endpointEl = document.getElementById("endpoint");
const tokenEl = document.getElementById("token");
const saveBtn = document.getElementById("save");
const testBtn = document.getElementById("test");
const refreshBtn = document.getElementById("refresh");
const statusEl = document.getElementById("status");

function showStatus(message, kind) {
  statusEl.textContent = message;
  statusEl.className = "status" + (kind ? ` ${kind}` : "");
  if (kind === "ok") {
    setTimeout(() => {
      statusEl.textContent = "";
      statusEl.className = "status";
    }, 2500);
  }
}

function normalizeEndpoint(raw) {
  return (raw || "").trim().replace(/\/$/, "");
}

async function load() {
  const { endpoint, token } = await chrome.storage.sync.get([
    "endpoint",
    "token",
  ]);
  endpointEl.value = endpoint || "";
  tokenEl.value = token || "";
}

async function save() {
  const endpoint = normalizeEndpoint(endpointEl.value);
  const token = tokenEl.value.trim();
  if (!endpoint) {
    showStatus("Site URL is required.", "err");
    return;
  }
  if (!token) {
    showStatus("API token is required.", "err");
    return;
  }
  await chrome.storage.sync.set({ endpoint, token });
  showStatus("Saved.", "ok");
}

async function test() {
  const endpoint = normalizeEndpoint(endpointEl.value);
  if (!endpoint) {
    showStatus("Set a site URL first.", "err");
    return;
  }
  try {
    const res = await fetch(`${endpoint}/api/tags`, { cache: "no-store" });
    if (!res.ok) {
      showStatus(`Could not reach the site (HTTP ${res.status}).`, "err");
      return;
    }
    const data = await res.json();
    const count = Array.isArray(data.tags) ? data.tags.length : 0;
    showStatus(`OK — fetched ${count} tag${count === 1 ? "" : "s"}.`, "ok");
  } catch (err) {
    showStatus(`Connection failed: ${err.message || err}`, "err");
  }
}

async function refresh() {
  await chrome.runtime.sendMessage({ type: "refreshTags" });
  showStatus("Tags refreshed in the context menu.", "ok");
}

saveBtn.addEventListener("click", save);
testBtn.addEventListener("click", test);
refreshBtn.addEventListener("click", refresh);
load();
