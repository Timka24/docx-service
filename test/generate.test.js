const test = require("node:test");
const assert = require("node:assert/strict");

const createGenerateRouter = require("../routes/generate");
const { ValidationError } = require("../lib/validation");

const { requireRenderablePrDate } = createGenerateRouter;

function rejectsPrDate(payload) {
  assert.throws(
    () => requireRenderablePrDate(payload),
    (error) => (
      error instanceof ValidationError
      && error.details.some((item) => item.path === "pr_date")
    )
  );
}

test("requireRenderablePrDate rejects missing call date", () => {
  rejectsPrDate({
    kv_num: "100-26-123",
    pr_date: "",
    pr_date_iso_raw: "",
  });
});

test("requireRenderablePrDate rejects invalid formatted call date", () => {
  rejectsPrDate({
    kv_num: "100-26-123",
    pr_date: "31.02.2024",
    pr_date_iso_raw: "",
  });
});

test("requireRenderablePrDate rejects invalid raw UI call date", () => {
  rejectsPrDate({
    kv_num: "100-26-123",
    pr_date: "",
    pr_date_iso_raw: "2024-02-31",
  });
});

test("requireRenderablePrDate accepts valid raw UI call date", () => {
  assert.doesNotThrow(() => requireRenderablePrDate({
    kv_num: "100-26-123",
    pr_date: "",
    pr_date_iso_raw: "2024-02-29",
  }));
});

test("requireRenderablePrDate accepts valid formatted call date", () => {
  assert.doesNotThrow(() => requireRenderablePrDate({
    kv_num: "100-26-123",
    pr_date: "29.02.2024",
    pr_date_iso_raw: "",
  }));
});
