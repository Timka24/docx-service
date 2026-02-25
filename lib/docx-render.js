const fs = require("fs");
const path = require("path");
const Docxtemplater = require("docxtemplater");
const PizZip = require("pizzip");

const DEFAULT_TEMPLATE_PATH = path.join(__dirname, "..", "template.docx");

function renderDocx(dataForTemplate, templatePath = DEFAULT_TEMPLATE_PATH) {
  if (!fs.existsSync(templatePath)) {
    const err = new Error(`Не найден шаблон DOCX: ${templatePath}`);
    err.code = "TEMPLATE_NOT_FOUND";
    throw err;
  }

  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "[[", end: "]]" }
  });

  doc.setData(dataForTemplate || {});

  try {
    doc.render();
  } catch (e) {
    const msg =
      e?.properties?.errors
        ?.map((er) => er.properties?.explanation)
        .filter(Boolean)
        .join("\n") ||
      e.message ||
      String(e);
     const err = new Error(`Ошибка шаблона DOCX:\n${msg}`);
    err.original = e;
    throw err;
  }

  return doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE"
  });
}

module.exports = { renderDocx, DEFAULT_TEMPLATE_PATH };
