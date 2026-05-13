const test = require("node:test");
const assert = require("node:assert/strict");

const {
  parseDateForPdfPath,
  resolvePrDateParts,
} = require("../worker/pdf-worker");

test("parseDateForPdfPath rejects impossible ISO date", () => {
  assert.equal(parseDateForPdfPath("2024-02-31"), null);
});

test("parseDateForPdfPath rejects non-leap year date", () => {
  assert.equal(parseDateForPdfPath("29.02.2023"), null);
});

test("resolvePrDateParts uses raw_data.pr_date_iso_raw fallback", () => {
  assert.deepEqual(
    resolvePrDateParts({
      data: {},
      raw_data: { pr_date_iso_raw: "2024-02-29" },
    }),
    { yyyy: "2024", mm: "02", dd: "29" }
  );
});
