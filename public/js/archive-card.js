const titleEl = document.getElementById("cardTitle");
const subtitleEl = document.getElementById("cardSubtitle");
const summaryArchiveId = document.getElementById("summaryArchiveId");
const summaryKvNum = document.getElementById("summaryKvNum");
const summaryUpdatedAt = document.getElementById("summaryUpdatedAt");
const summaryLastVersion = document.getElementById("summaryLastVersion");
const summaryDocxStatus = document.getElementById("summaryDocxStatus");
const summaryPdfStatus = document.getElementById("summaryPdfStatus");
const summaryLastDocxAt = document.getElementById("summaryLastDocxAt");
const summaryLastPdfAt = document.getElementById("summaryLastPdfAt");
const docxVersionSelect = document.getElementById("docxVersionSelect");
const downloadDocxBtn = document.getElementById("downloadDocxBtn");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");
const renderHistoryRows = document.getElementById("renderHistoryRows");
const rawDataPre = document.getElementById("rawDataPre");
const dataPre = document.getElementById("dataPre");
const pdfVersioningInfo = document.getElementById("pdfVersioningInfo");

let currentArchiveId = null;

function parseArchiveIdFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const tail = parts[parts.length - 1];
  const id = Number(tail);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("ru-RU");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderStatusBadge(status) {
  const value = typeof status === "string" ? status.trim() : "";
  if (value === "ready") return '<span class="badge badge-ready">ready</span>';
  if (value === "pending") return '<span class="badge badge-pending">pending</span>';
  if (value === "failed") return '<span class="badge badge-failed">failed</span>';
  return '<span class="badge badge-empty">нет</span>';
}

function renderSummary(archive) {
  summaryArchiveId.textContent = String(archive.id ?? "—");
  summaryKvNum.textContent = archive.kv_num || "—";
  summaryUpdatedAt.textContent = formatDate(archive.updated_at || archive.created_at);
  summaryLastVersion.textContent = archive.last_version == null ? "—" : String(archive.last_version);
  summaryDocxStatus.innerHTML = renderStatusBadge(archive.last_docx_status);
  summaryPdfStatus.innerHTML = renderStatusBadge(archive.last_pdf_status);
  summaryLastDocxAt.textContent = formatDate(archive.last_docx_rendered_at);
  summaryLastPdfAt.textContent = formatDate(archive.last_pdf_rendered_at);

  titleEl.textContent = `Архив #${archive.id}`;
  subtitleEl.textContent = archive.kv_num ? `Карта: ${archive.kv_num}` : "kv_num отсутствует";
}

function renderDocxControls(archive, renders) {
  const versions = renders
    .filter((row) => typeof row.docx_key === "string" && row.docx_key.trim())
    .map((row) => row.version);

  docxVersionSelect.innerHTML = "";
  if (versions.length === 0) {
    docxVersionSelect.append(new Option("Файл отсутствует", ""));
    docxVersionSelect.disabled = true;
    downloadDocxBtn.disabled = true;
    return;
  }

  versions.forEach((version) => {
    docxVersionSelect.append(new Option(`Версия ${version}`, String(version)));
  });

  docxVersionSelect.disabled = false;
  downloadDocxBtn.disabled = false;
  if (archive.last_version != null) {
    const last = String(archive.last_version);
    if (versions.map(String).includes(last)) {
      docxVersionSelect.value = last;
    }
  }
}

function renderPdfControls(hasPdf) {
  downloadPdfBtn.disabled = !hasPdf;
}

function renderHistory(archive, renders) {
  if (!Array.isArray(renders) || renders.length === 0) {
    renderHistoryRows.innerHTML = '<tr><td colspan="6" class="empty-state">История рендеров пока пустая.</td></tr>';
    pdfVersioningInfo.textContent = "PDF не версионируется отдельным именем файла; показываются статусы и доступность по версиям рендера.";
    return;
  }

  const rows = [];
  renders.forEach((render) => {
    const isLatest = render.version === archive.last_version;
    const latestClass = isLatest ? "latest-render" : "";

    const docxDownload = (typeof render.docx_key === "string" && render.docx_key.trim())
      ? `<a class="btn btn-secondary" href="/api/archive/${archive.id}/download/docx?version=${render.version}">Скачать</a>`
      : '<span class="muted">—</span>';

    const pdfDownload = (typeof render.pdf_key === "string" && render.pdf_key.trim())
      ? `<a class="btn btn-secondary" href="/api/archive/${archive.id}/download/pdf">Скачать</a>`
      : '<span class="muted">—</span>';

    rows.push(`
      <tr class="${latestClass}">
        <td>DOCX</td>
        <td>${render.version}${isLatest ? " (последняя)" : ""}</td>
        <td>${renderStatusBadge(render.docx_status)}</td>
        <td>${escapeHtml(formatDate(render.created_at))}</td>
        <td>${escapeHtml(render.docx_error || "")}</td>
        <td>${docxDownload}</td>
      </tr>
      <tr class="${latestClass}">
        <td>PDF</td>
        <td>${render.version}${isLatest ? " (последняя)" : ""}</td>
        <td>${renderStatusBadge(render.pdf_status)}</td>
        <td>${escapeHtml(formatDate(render.created_at))}</td>
        <td>${escapeHtml(render.pdf_error || "")}</td>
        <td>${pdfDownload}</td>
      </tr>
    `);
  });

  renderHistoryRows.innerHTML = rows.join("");
  pdfVersioningInfo.textContent = "PDF хранится как актуальный файл записи, но статусы/попытки отображаются по каждой версии рендера.";
}

function renderDebug(archive) {
  rawDataPre.textContent = JSON.stringify(archive.raw_data || {}, null, 2);
  dataPre.textContent = JSON.stringify(archive.data || {}, null, 2);
}

async function loadArchiveCard() {
  currentArchiveId = parseArchiveIdFromPath();
  if (!currentArchiveId) {
    titleEl.textContent = "Некорректный archive_id";
    subtitleEl.textContent = "Проверьте URL.";
    return;
  }

  try {
    const resp = await fetch(`/api/archive/${currentArchiveId}`);
    const body = await resp.json().catch(() => null);

    if (!resp.ok || !body) {
      const err = body?.error || `HTTP ${resp.status}`;
      titleEl.textContent = `Ошибка: ${err}`;
      subtitleEl.textContent = "Не удалось загрузить карточку.";
      return;
    }

    const renders = Array.isArray(body.renders) ? body.renders : [];
    renderSummary(body);
    renderDocxControls(body, renders);
    renderPdfControls(Boolean(body.has_pdf));
    renderHistory(body, renders);
    renderDebug(body);
  } catch {
    titleEl.textContent = "Ошибка сети";
    subtitleEl.textContent = "Сервер недоступен.";
  }
}

downloadDocxBtn.addEventListener("click", () => {
  const version = docxVersionSelect.value;
  if (!currentArchiveId || !version) return;
  const url = `/api/archive/${currentArchiveId}/download/docx?version=${encodeURIComponent(version)}`;
  window.location.href = url;
});

downloadPdfBtn.addEventListener("click", () => {
  if (!currentArchiveId) return;
  const url = `/api/archive/${currentArchiveId}/download/pdf`;
  window.location.href = url;
});

loadArchiveCard();
