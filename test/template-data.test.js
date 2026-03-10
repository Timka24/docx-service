const test = require("node:test");
const assert = require("node:assert/strict");

const { buildTemplateData } = require("../lib/template-data");

test("buildTemplateData uses renamed witness placeholders", () => {
  const data = buildTemplateData({ witness: "brigade" });

  assert.equal(data.wit_cb, "☐");
  assert.equal(data.bri_cb, "☑");
  assert.equal(data.no_cb, "☐");

  assert.equal("witness_cb" in data, false);
  assert.equal("brigade_cb" in data, false);
  assert.equal("none_cb" in data, false);
});

test("buildTemplateData maps death_place=location to d_lo checkbox", () => {
  const data = buildTemplateData({ death_place: "location" });

  assert.equal(data.d_lo, "☑");
  assert.equal(data.d_ev, "☐");
});

test("buildTemplateData maps death_place=evac to d_ev checkbox", () => {
  const data = buildTemplateData({ death_place: "evac" });

  assert.equal(data.d_lo, "☐");
  assert.equal(data.d_ev, "☑");
});

test("buildTemplateData keeps d_lo and d_ev empty-check when death_place missing", () => {
  const data = buildTemplateData({});

  assert.equal(data.d_lo, "☐");
  assert.equal(data.d_ev, "☐");
});


test("template.docx contains new placeholders and no legacy witness placeholders", async () => {
  const { readFile } = require("node:fs/promises");
  const { unzipSync } = require("node:zlib");

  const buf = await readFile("template.docx");
  const marker = Buffer.from("word/document.xml");
  const idx = buf.indexOf(marker);
  assert.notEqual(idx, -1);

  // minimal zip scan to extract document.xml
  let xml = "";
  let offset = 0;
  while (offset < buf.length - 30) {
    if (buf.readUInt32LE(offset) !== 0x04034b50) {
      offset += 1;
      continue;
    }
    const nameLen = buf.readUInt16LE(offset + 26);
    const extraLen = buf.readUInt16LE(offset + 28);
    const compMethod = buf.readUInt16LE(offset + 8);
    const compSize = buf.readUInt32LE(offset + 18);
    const fileName = buf.slice(offset + 30, offset + 30 + nameLen).toString("utf8");
    const dataStart = offset + 30 + nameLen + extraLen;
    const dataEnd = dataStart + compSize;

    if (fileName === "word/document.xml") {
      const chunk = buf.slice(dataStart, dataEnd);
      xml = (compMethod === 8 ? unzipSync(chunk) : chunk).toString("utf8");
      break;
    }
    offset = dataEnd;
  }

  assert.notEqual(xml, "");
  assert.equal(xml.includes("[[wit_cb]]"), true);
  assert.equal(xml.includes("[[bri_cb]]"), true);
  assert.equal(xml.includes("[[no_cb]]"), true);
  assert.equal(xml.includes("[[d_lo]]"), true);
  assert.equal(xml.includes("[[d_ev]]"), true);
  assert.equal(xml.includes("[[witness_cb]]"), false);
  assert.equal(xml.includes("[[brigade_cb]]"), false);
  assert.equal(xml.includes("[[none_cb]]"), false);
});
