const path = require("path");
const express = require("express");
const { buildTemplateData } = require("../lib/template-data");
const { renderDocx } = require("../lib/docx-render");

const router = express.Router();

function createGenerateRouter(pool) {
  router.post("/generate", async (req, res) => {
    try {
      const dataForTemplate = buildTemplateData(req.body);

      let archiveId = null;
      try {
        const ins = await pool.query(
          "insert into archives (data, stored, docx_key) values ($1, false, null) returning id",
          [dataForTemplate]
        );
        archiveId = ins.rows[0].id;
      } catch (e) {
        console.error("DB insert error:", e);
        return res.status(500).send("Ошибка БД: " + (e.message || e));
      }

      const templatePath = path.join(__dirname, "..", "template.docx");
      const buf = renderDocx(dataForTemplate, templatePath);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="filled_${archiveId}.docx"`
      );

      return res.send(buf);
    } catch (err) {
      if (err.code === "TEMPLATE_NOT_FOUND") {
        return res.status(500).send(err.message);
      }
      if (err.original) {
        console.error("Template error:", err.original);
      }
      console.log("===== DOCX GENERATE ERROR =====");
      console.log(err);
      console.log("JSON:", JSON.stringify(err, null, 2));
      console.log("================================");

      return res
        .status(500)
        .type("application/json")
        .send(JSON.stringify(err, null, 2));
    }
  });

  return router;
}

module.exports = createGenerateRouter;
