const test = require("node:test");
const assert = require("node:assert/strict");

const { buildTemplateData } = require("../lib/template-data");

test("buildTemplateData sets slr_and when AND is selected", () => {
  const data = buildTemplateData({ slr: "and" });
  assert.equal(data.slr_and, "☑");
});

test("buildTemplateData keeps slr_and empty for other options", () => {
  const data = buildTemplateData({ slr: "comp_ivl" });
  assert.equal(data.slr_and, "☐");
});

test("buildTemplateData normalizes i_t to HH:MM", () => {
  const data = buildTemplateData({ i_t: "7:5" });
  assert.equal(data.i_t, "07:05");
});

test("buildTemplateData clears invalid i_t", () => {
  const data = buildTemplateData({ i_t: "24:00" });
  assert.equal(data.i_t, "");
});
