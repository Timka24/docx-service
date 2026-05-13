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

test("buildTemplateData does not convert impossible pr_date to ISO", () => {
  const data = buildTemplateData({ pr_date: "31.02.2024" });
  assert.notEqual(data.pr_date_iso, "2024-02-31");
  assert.equal(data.pr_date_iso, "");
});

test("buildTemplateData converts valid leap day pr_date to ISO", () => {
  const data = buildTemplateData({ pr_date: "29.02.2024" });
  assert.equal(data.pr_date_iso, "2024-02-29");
});
