const express = require("express");
const { HttpError, saveArchive, createRenderVersion } = require("../lib/archive-service");
const { ValidationError, validatePayload } = require("../lib/validation");

function createGenerateRouter(pool) {
  const router = express.Router();

  router.post("/generate", async (req, res) => {
    try {
      validatePayload(req.body);
      const saved = await saveArchive(pool, req.body);

      try {
        const render = await createRenderVersion(pool, saved.archiveId);
        return res.json({
          archive_id: saved.archiveId,
          render_id: render.renderId,
          version: render.version,
          message: "queued",
        });
      } catch (e) {
        if (e instanceof HttpError && e.status === 400 && e.message === "kv_num_required_for_render") {
          return res.json({
            archive_id: saved.archiveId,
            render_id: null,
            version: null,
            message: "saved_no_kv_num",
          });
        }
        throw e;
      }
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(err.status).json({ error: err.code, details: err.details });
      }
      if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.message });
      }

      console.error("Generate error:", err);
      return res.status(500).json({ error: "internal_error" });
    }
  });

  return router;
}

module.exports = createGenerateRouter;