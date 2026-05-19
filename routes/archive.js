const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const { HttpError, saveArchive, createRenderVersion } = require("../lib/archive-service");
const { ValidationError, validatePayload } = require("../lib/validation");

const DOCX_DIR = process.env.DOCX_DIR || path.join(__dirname, "..", "storage", "docx");
const PDF_DIR = process.env.PDF_DIR || path.join(__dirname, "..", "storage", "pdf");

function parsePositiveInt(value, fallback) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) return fallback;
  return num;
}

function sanitizePageSize(value) {
  const size = parsePositiveInt(value, 20);
  if (size === 50) return 50;
  return 20;
}

function parseArchiveId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function parseOptionalDate(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  return trimmed;
}

function normalizeHasFilter(value) {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (raw === "yes" || raw === "no") return raw;
  return "all";
}

function sanitizeFilenamePart(value, fallback) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return fallback;
  return text.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

function resolveStoragePath(baseDir, relKey) {
  if (typeof relKey !== "string" || !relKey.trim()) return null;
  const base = path.resolve(baseDir);
  const abs = path.resolve(base, relKey);
  if (abs !== base && !abs.startsWith(`${base}${path.sep}`)) {
    return null;
  }
  return abs;
}

async function canReadFile(absPath) {
  try {
    await fs.access(absPath);
    return true;
  } catch {
    return false;
  }
}

function buildArchiveListWhere(req) {
  const where = [];
  const params = [];

  const kvNum = typeof req.query.kv_num === "string" ? req.query.kv_num.trim() : "";
  if (kvNum) {
    params.push(`%${kvNum}%`);
    where.push(`a.kv_num ilike $${params.length}`);
  }

  const dateFrom = parseOptionalDate(req.query.date_from);
  if (dateFrom) {
    params.push(dateFrom);
    where.push(`a.updated_at::date >= $${params.length}::date`);
  }

  const dateTo = parseOptionalDate(req.query.date_to);
  if (dateTo) {
    params.push(dateTo);
    where.push(`a.updated_at::date <= $${params.length}::date`);
  }

  const hasDocx = normalizeHasFilter(req.query.has_docx);
  if (hasDocx === "yes") {
    where.push("exists (select 1 from archive_renders ar where ar.archive_id = a.id and coalesce(ar.docx_key, '') <> '')");
  }
  if (hasDocx === "no") {
    where.push("not exists (select 1 from archive_renders ar where ar.archive_id = a.id and coalesce(ar.docx_key, '') <> '')");
  }

  const hasPdf = normalizeHasFilter(req.query.has_pdf);
  if (hasPdf === "yes") {
    where.push("exists (select 1 from archive_renders ar where ar.archive_id = a.id and coalesce(ar.pdf_key, '') <> '')");
  }
  if (hasPdf === "no") {
    where.push("not exists (select 1 from archive_renders ar where ar.archive_id = a.id and coalesce(ar.pdf_key, '') <> '')");
  }

  return {
    whereSql: where.length ? `where ${where.join(" and ")}` : "",
    params,
  };
}

function createArchiveRouter(pool) {
  const router = express.Router();

  async function handleArchiveList(req, res) {
    const page = parsePositiveInt(req.query.page, 1);
    const pageSize = sanitizePageSize(req.query.page_size);
    const offset = (page - 1) * pageSize;

    const { whereSql, params } = buildArchiveListWhere(req);

    try {
      const countSql = `select count(*)::int as total from archives a ${whereSql}`;
      const countRes = await pool.query(countSql, params);
      const total = Number(countRes.rows[0]?.total || 0);

      const listSql = `
        select a.id,
               a.created_at,
               a.updated_at,
               a.kv_num,
               exists (
                 select 1 from archive_renders ex where ex.archive_id = a.id and coalesce(ex.docx_key, '') <> ''
               ) as has_docx,
               exists (
                 select 1 from archive_renders ex where ex.archive_id = a.id and coalesce(ex.pdf_key, '') <> ''
               ) as has_pdf,
               lr.version as last_version,
               lr.docx_status as last_docx_status,
               lr.pdf_status as last_pdf_status
          from archives a
     left join lateral (
               select ar.version,
                      ar.docx_status,
                      ar.pdf_status
                 from archive_renders ar
                where ar.archive_id = a.id
             order by ar.version desc
                limit 1
              ) lr on true
          ${whereSql}
      order by a.id desc
         limit $${params.length + 1}
        offset $${params.length + 2}`;

      const listRes = await pool.query(listSql, [...params, pageSize, offset]);
      const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;

      res.json({
        items: listRes.rows,
        page,
        page_size: pageSize,
        total,
        total_pages: totalPages,
      });
    } catch (e) {
      console.error("Archive list error:", e);
      res.status(500).json({ error: "internal_error" });
    }
  }

  async function handleArchiveByKv(req, res) {
    const kvNum = typeof req.query.kv_num === "string" ? req.query.kv_num.trim() : "";
    if (!kvNum) {
      return res.status(400).json({ error: "invalid_kv_num" });
    }

    try {
      const archive = await pool.query(
        `select id, created_at, kv_num, updated_at, raw_data
           from archives
          where kv_num = $1
          limit 1`,
        [kvNum]
      );

      if (!archive.rows[0]) {
        return res.status(404).json({ error: "not_found" });
      }

      return res.json(archive.rows[0]);
    } catch (e) {
      console.error("Archive lookup by kv_num error:", e);
      return res.status(500).json({ error: "internal_error" });
    }
  }

  async function handleArchiveDetails(req, res) {
    const id = parseArchiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "invalid_archive_id" });
    }

    try {
      const archive = await pool.query(
        `select a.id,
                a.created_at,
                a.updated_at,
                a.kv_num,
                a.raw_data,
                a.data,
                lr.version as last_version,
                lr.docx_status as last_docx_status,
                lr.pdf_status as last_pdf_status,
                (select max(created_at)
                   from archive_renders x
                  where x.archive_id = a.id
                    and coalesce(x.docx_key, '') <> '') as last_docx_rendered_at,
                (select max(created_at)
                   from archive_renders x
                  where x.archive_id = a.id
                    and coalesce(x.pdf_key, '') <> '') as last_pdf_rendered_at,
                exists (
                  select 1 from archive_renders x
                  where x.archive_id = a.id
                    and coalesce(x.docx_key, '') <> ''
                ) as has_docx,
                exists (
                  select 1 from archive_renders x
                  where x.archive_id = a.id
                    and coalesce(x.pdf_key, '') <> ''
                ) as has_pdf
           from archives a
      left join lateral (
                select ar.version,
                       ar.docx_status,
                       ar.pdf_status
                  from archive_renders ar
                 where ar.archive_id = a.id
              order by ar.version desc
                 limit 1
               ) lr on true
          where a.id = $1`,
        [id]
      );

      if (!archive.rows[0]) {
        return res.status(404).json({ error: "not_found" });
      }

      const renders = await pool.query(
        `select id,
                version,
                created_at,
                docx_status,
                pdf_status,
                docx_key,
                pdf_key,
                docx_error,
                pdf_error,
                pdf_attempts,
                pdf_next_attempt_at
           from archive_renders
          where archive_id = $1
       order by version desc`,
        [id]
      );

      return res.json({
        ...archive.rows[0],
        renders: renders.rows,
      });
    } catch (e) {
      console.error("Archive details error:", e);
      return res.status(500).json({ error: "internal_error" });
    }
  }

  async function handleDownloadDocx(req, res) {
    const id = parseArchiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "invalid_archive_id" });
    }

    const requestedVersion = req.query.version == null ? null : parsePositiveInt(req.query.version, null);
    if (req.query.version != null && !requestedVersion) {
      return res.status(400).json({ error: "invalid_version" });
    }

    try {
      const archiveRes = await pool.query("select id, kv_num from archives where id = $1", [id]);
      const archive = archiveRes.rows[0];
      if (!archive) {
        return res.status(404).json({ error: "not_found" });
      }

      const renderSql = requestedVersion
        ? `select version, docx_key
             from archive_renders
            where archive_id = $1
              and version = $2
              and coalesce(docx_key, '') <> ''
            limit 1`
        : `select version, docx_key
             from archive_renders
            where archive_id = $1
              and coalesce(docx_key, '') <> ''
         order by version desc
            limit 1`;

      const renderParams = requestedVersion ? [id, requestedVersion] : [id];
      const renderRes = await pool.query(renderSql, renderParams);
      const render = renderRes.rows[0];

      if (!render || typeof render.docx_key !== "string" || !render.docx_key.trim()) {
        return res.status(404).json({ error: "docx_not_found" });
      }

      const absPath = resolveStoragePath(DOCX_DIR, render.docx_key);
      if (!absPath || !(await canReadFile(absPath))) {
        return res.status(404).json({ error: "docx_file_not_found" });
      }

      const kvPart = sanitizeFilenamePart(archive.kv_num, `archive-${id}`);
      const filename = `${kvPart}-v${render.version}.docx`;
      return res.download(absPath, filename);
    } catch (e) {
      console.error("DOCX download error:", e);
      return res.status(500).json({ error: "internal_error" });
    }
  }

  async function handleDownloadPdf(req, res) {
    const id = parseArchiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "invalid_archive_id" });
    }

    try {
      const archiveRes = await pool.query("select id, kv_num from archives where id = $1", [id]);
      const archive = archiveRes.rows[0];
      if (!archive) {
        return res.status(404).json({ error: "not_found" });
      }

      const renderRes = await pool.query(
        `select version, pdf_key
           from archive_renders
          where archive_id = $1
            and coalesce(pdf_key, '') <> ''
       order by version desc
          limit 1`,
        [id]
      );

      const render = renderRes.rows[0];
      if (!render || typeof render.pdf_key !== "string" || !render.pdf_key.trim()) {
        return res.status(404).json({ error: "pdf_not_found" });
      }

      const absPath = resolveStoragePath(PDF_DIR, render.pdf_key);
      if (!absPath || !(await canReadFile(absPath))) {
        return res.status(404).json({ error: "pdf_file_not_found" });
      }

      const kvPart = sanitizeFilenamePart(archive.kv_num, `archive-${id}`);
      const filename = `${kvPart}.pdf`;
      return res.download(absPath, filename);
    } catch (e) {
      console.error("PDF download error:", e);
      return res.status(500).json({ error: "internal_error" });
    }
  }

  async function handleArchiveSave(req, res) {
    try {
      validatePayload(req.body);
      const saved = await saveArchive(pool, req.body);
      res.json({ archive_id: saved.archiveId });
    } catch (e) {
      if (e instanceof ValidationError) {
        return res.status(e.status).json({ error: e.code, details: e.details });
      }
      if (e instanceof HttpError) {
        return res.status(e.status).json({ error: e.message });
      }
      console.error("Archive save error:", e);
      return res.status(500).json({ error: "internal_error" });
    }
  }

  async function handleQueueRender(req, res) {
    const id = parseArchiveId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "invalid_archive_id" });
    }

    try {
      const render = await createRenderVersion(pool, id);
      return res.json({
        ok: true,
        archive_id: id,
        render_id: render.renderId,
        version: render.version,
        already_pending: Boolean(render.alreadyPending),
        message: render.alreadyPending ? "Формирование уже выполняется" : "queued",
      });
    } catch (e) {
      if (e instanceof ValidationError) {
        return res.status(e.status).json({ error: e.code, details: e.details });
      }
      if (e instanceof HttpError) {
        return res.status(e.status).json({ error: e.message });
      }
      console.error("Archive render queue error:", e);
      return res.status(500).json({ error: "internal_error" });
    }
  }

  router.get("/api/archive", handleArchiveList);
  router.get("/api/archive/by-kv", handleArchiveByKv);
  router.get("/api/archive/:id", handleArchiveDetails);
  router.get("/api/archive/:id/download/docx", handleDownloadDocx);
  router.get("/api/archive/:id/download/pdf", handleDownloadPdf);
  router.post("/api/archive/save", handleArchiveSave);
  router.post("/api/archive/:id/render", handleQueueRender);

  // Backward-compatible endpoints used by the form flow.
  router.get("/archive/by-kv", handleArchiveByKv);
  router.post("/archive/save", handleArchiveSave);
  router.post("/archive/:id/render", handleQueueRender);

  return router;
}

module.exports = createArchiveRouter;
