const express = require("express");
const { HttpError, saveArchive, createRenderVersion } = require("../lib/archive-service");

function createArchiveRouter(pool) {
  const router = express.Router();

  router.get("/archive", async (req, res) => {
    try {
      const r = await pool.query(
        `select a.id,
                a.created_at,
                a.kv_num,
                a.updated_at,
                lr.version as last_version,
                lr.docx_status as last_docx_status,
                lr.pdf_status as last_pdf_status
           from archives a
      left join lateral (
                 select ar.version, ar.docx_status, ar.pdf_status
                   from archive_renders ar
                  where ar.archive_id = a.id
               order by ar.version desc
                  limit 1
                ) lr on true
       order by a.id desc
          limit 100`
      );
      res.json(r.rows);
    } catch (e) {
      console.error("Archive list error:", e);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.get("/archive/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "invalid_archive_id" });
    }

    try {
      const archive = await pool.query(
        `select id, created_at, kv_num, updated_at, raw_data
           from archives
          where id = $1`,
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
                pdf_error
           from archive_renders
          where archive_id = $1
       order by version desc`,
        [id]
      );

      res.json({
        ...archive.rows[0],
        renders: renders.rows,
      });
    } catch (e) {
      console.error("Archive details error:", e);
      res.status(500).json({ error: "internal_error" });
    }
  });

  router.post("/archive/save", async (req, res) => {
    try {
      const saved = await saveArchive(pool, req.body);
      res.json({ archive_id: saved.archiveId });
    } catch (e) {
      if (e instanceof HttpError) {
        return res.status(e.status).json({ error: e.message });
      }
      console.error("Archive save error:", e);
      return res.status(500).json({ error: "internal_error" });
    }
  });

  router.post("/archive/:id/render", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "invalid_archive_id" });
    }

    try {
      const render = await createRenderVersion(pool, id);
      return res.json({
        archive_id: id,
        render_id: render.renderId,
        version: render.version,
      });
    } catch (e) {
      if (e instanceof HttpError) {
        return res.status(e.status).json({ error: e.message });
      }
      console.error("Archive render queue error:", e);
      return res.status(500).json({ error: "internal_error" });
    }
  });

  return router;
}

module.exports = createArchiveRouter;
