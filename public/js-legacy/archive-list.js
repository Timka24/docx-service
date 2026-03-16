const DEFAULT_STATE = {
  page: 1,
  page_size: 20,
  kv_num: "",
  date_from: "",
  date_to: "",
  has_docx: "all",
  has_pdf: "all"
};
const state = {
  ...DEFAULT_STATE
};
const filtersForm = document.getElementById("filtersForm");
const kvNumInput = document.getElementById("kvNum");
const dateFromInput = document.getElementById("dateFrom");
const dateToInput = document.getElementById("dateTo");
const hasDocxSelect = document.getElementById("hasDocx");
const hasPdfSelect = document.getElementById("hasPdf");
const pageSizeSelect = document.getElementById("pageSize");
const resetFiltersBtn = document.getElementById("resetFiltersBtn");
const archiveRows = document.getElementById("archiveRows");
const listInfo = document.getElementById("listInfo");
const pageInfo = document.getElementById("pageInfo");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
function parsePositiveInt(value, fallback) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) return fallback;
  return num;
}
function parseHasValue(value) {
  return value === "yes" || value === "no" ? value : "all";
}
function parsePageSize(value) {
  return Number(value) === 50 ? 50 : 20;
}
function readStateFromQuery() {
  const params = new URLSearchParams(window.location.search);
  state.page = parsePositiveInt(params.get("page"), 1);
  state.page_size = parsePageSize(params.get("page_size"));
  state.kv_num = (params.get("kv_num") || "").trim();
  state.date_from = (params.get("date_from") || "").trim();
  state.date_to = (params.get("date_to") || "").trim();
  state.has_docx = parseHasValue((params.get("has_docx") || "all").trim());
  state.has_pdf = parseHasValue((params.get("has_pdf") || "all").trim());
}
function syncFormFromState() {
  kvNumInput.value = state.kv_num;
  dateFromInput.value = state.date_from;
  dateToInput.value = state.date_to;
  hasDocxSelect.value = state.has_docx;
  hasPdfSelect.value = state.has_pdf;
  pageSizeSelect.value = String(state.page_size);
}
function updateUrlFromState() {
  const params = new URLSearchParams();
  params.set("page", String(state.page));
  params.set("page_size", String(state.page_size));
  if (state.kv_num) params.set("kv_num", state.kv_num);
  if (state.date_from) params.set("date_from", state.date_from);
  if (state.date_to) params.set("date_to", state.date_to);
  if (state.has_docx !== "all") params.set("has_docx", state.has_docx);
  if (state.has_pdf !== "all") params.set("has_pdf", state.has_pdf);
  const next = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState(null, "", next);
}
function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("ru-RU");
}
function escapeHtml(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function renderStatusBadge(status) {
  const value = typeof status === "string" ? status.trim() : "";
  if (value === "ready") {
    return '<span class="badge badge-ready">ready</span>';
  }
  if (value === "pending") {
    return '<span class="badge badge-pending">pending</span>';
  }
  if (value === "failed") {
    return '<span class="badge badge-failed">failed</span>';
  }
  return '<span class="badge badge-empty">нет</span>';
}
function renderEmpty(message) {
  archiveRows.innerHTML = `<tr><td colspan="7" class="empty-state">${escapeHtml(message)}</td></tr>`;
}
function readFiltersFromForm({
  resetPage
}) {
  state.kv_num = kvNumInput.value.trim();
  state.date_from = dateFromInput.value;
  state.date_to = dateToInput.value;
  state.has_docx = parseHasValue(hasDocxSelect.value);
  state.has_pdf = parseHasValue(hasPdfSelect.value);
  state.page_size = parsePageSize(pageSizeSelect.value);
  if (resetPage) state.page = 1;
}
async function loadArchives() {
  listInfo.textContent = "Загрузка...";
  renderEmpty("Загрузка...");
  prevPageBtn.disabled = true;
  nextPageBtn.disabled = true;
  const params = new URLSearchParams({
    page: String(state.page),
    page_size: String(state.page_size)
  });
  if (state.kv_num) params.set("kv_num", state.kv_num);
  if (state.date_from) params.set("date_from", state.date_from);
  if (state.date_to) params.set("date_to", state.date_to);
  if (state.has_docx !== "all") params.set("has_docx", state.has_docx);
  if (state.has_pdf !== "all") params.set("has_pdf", state.has_pdf);
  updateUrlFromState();
  try {
    const resp = await fetch(`/api/archive?${params.toString()}`);
    const body = await resp.json().catch(() => null);
    if (!resp.ok || !body) {
      const err = (body === null || body === void 0 ? void 0 : body.error) || `HTTP ${resp.status}`;
      listInfo.innerHTML = `<span class="error-text">Ошибка загрузки: ${escapeHtml(err)}</span>`;
      renderEmpty("Не удалось загрузить список.");
      return;
    }
    const items = Array.isArray(body.items) ? body.items : [];
    const total = Number(body.total || 0);
    const totalPages = Number(body.total_pages || 1);
    const currentPage = parsePositiveInt(body.page, 1);
    if (items.length === 0) {
      renderEmpty("Записей не найдено.");
    } else {
      archiveRows.innerHTML = items.map(item => {
        const id = Number(item.id);
        const kv = escapeHtml(item.kv_num || "—");
        const updated = escapeHtml(formatDate(item.updated_at || item.created_at));
        const version = item.last_version == null ? "—" : escapeHtml(String(item.last_version));
        return `
          <tr>
            <td>${id}</td>
            <td>${kv}</td>
            <td>${updated}</td>
            <td>${renderStatusBadge(item.last_docx_status)}</td>
            <td>${renderStatusBadge(item.last_pdf_status)}</td>
            <td>${version}</td>
            <td><a class="btn btn-secondary" href="/archive/${id}">Открыть</a></td>
          </tr>`;
      }).join("");
    }
    const from = total === 0 ? 0 : (currentPage - 1) * state.page_size + 1;
    const to = Math.min(currentPage * state.page_size, total);
    listInfo.textContent = `Показано ${from}-${to} из ${total}`;
    pageInfo.textContent = `Страница ${currentPage} / ${totalPages}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
  } catch (_unused) {
    listInfo.innerHTML = '<span class="error-text">Ошибка сети/сервер недоступен.</span>';
    renderEmpty("Ошибка сети.");
  }
}
filtersForm.addEventListener("submit", async event => {
  event.preventDefault();
  readFiltersFromForm({
    resetPage: true
  });
  await loadArchives();
});
resetFiltersBtn.addEventListener("click", async () => {
  Object.assign(state, DEFAULT_STATE);
  syncFormFromState();
  await loadArchives();
});
pageSizeSelect.addEventListener("change", async () => {
  readFiltersFromForm({
    resetPage: true
  });
  await loadArchives();
});
prevPageBtn.addEventListener("click", async () => {
  if (state.page <= 1) return;
  state.page -= 1;
  await loadArchives();
});
nextPageBtn.addEventListener("click", async () => {
  state.page += 1;
  await loadArchives();
});
kvNumInput.addEventListener("keydown", async event => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  readFiltersFromForm({
    resetPage: true
  });
  await loadArchives();
});
readStateFromQuery();
syncFormFromState();
loadArchives();
//# sourceMappingURL=archive-list.js.map