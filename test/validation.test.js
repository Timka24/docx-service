const test = require("node:test");
const assert = require("node:assert/strict");

const { ValidationError, validatePayload } = require("../lib/validation");

function row70(firstValue = "") {
  return Array.from({ length: 70 }, (_, idx) => (idx === 0 ? firstValue : ""));
}

function rejectsPath(payload, path) {
  assert.throws(
    () => validatePayload(payload),
    (error) => error instanceof ValidationError && error.details.some((item) => item.path === path)
  );
}

test("validatePayload accepts i_t in HH:MM format", () => {
  assert.doesNotThrow(() => validatePayload({ i_t: "00:00" }));
  assert.doesNotThrow(() => validatePayload({ i_t: "23:59" }));
  assert.doesNotThrow(() => validatePayload({ i_t: "7:05" }));
});

test("validatePayload rejects invalid i_t", () => {
  assert.throws(
    () => validatePayload({ i_t: "24:00" }),
    (error) => error instanceof ValidationError && error.details.some((item) => item.path === "i_t")
  );
});

test("validatePayload accepts numeric grid value with 10 chars", () => {
  assert.doesNotThrow(() => validatePayload({ ch_adr_nacl_ml_marks: row70("1234567890") }));
});

test("validatePayload rejects numeric grid value over 10 chars", () => {
  rejectsPath({ ch_adr_nacl_ml_marks: row70("12345678901") }, "ch_adr_nacl_ml_marks[0]");
});

test("validatePayload rejects regular grid value over 8 chars", () => {
  rejectsPath({ ch_cpr_a_marks: row70("123456789") }, "ch_cpr_a_marks[0]");
});

test("validatePayload accepts empty numeric grid value", () => {
  assert.doesNotThrow(() => validatePayload({ ch_adr_nacl_ml_marks: row70("") }));
});

test("validatePayload accepts unknown string field", () => {
  assert.doesNotThrow(() => validatePayload({ ui_form_mode: "basic" }));
});

test("validatePayload rejects unknown object field", () => {
  rejectsPath({ unknown_field: { nested: true } }, "unknown_field");
});

test("validatePayload rejects unknown array field", () => {
  rejectsPath({ unknown_field: ["value"] }, "unknown_field");
});

test("validatePayload rejects unknown number field", () => {
  rejectsPath({ unknown_field: 42 }, "unknown_field");
});

test("validatePayload rejects unknown boolean field", () => {
  rejectsPath({ unknown_field: true }, "unknown_field");
});

test("validatePayload rejects unknown null field", () => {
  rejectsPath({ unknown_field: null }, "unknown_field");
});

test("validatePayload rejects impossible February date", () => {
  rejectsPath({ pr_date: "31.02.2024" }, "pr_date");
});

test("validatePayload accepts leap day in leap year", () => {
  assert.doesNotThrow(() => validatePayload({ pr_date: "29.02.2024" }));
});

test("validatePayload rejects leap day in non-leap year", () => {
  rejectsPath({ pr_date: "29.02.2023" }, "pr_date");
});

test("validatePayload rejects impossible April date", () => {
  rejectsPath({ pr_date: "31.04.2024" }, "pr_date");
});

test("validatePayload accepts valid April date", () => {
  assert.doesNotThrow(() => validatePayload({ pr_date: "30.04.2024" }));
});

test("validatePayload rejects invalid pr_date_iso_raw", () => {
  rejectsPath({ pr_date_iso_raw: "2024-02-31" }, "pr_date_iso_raw");
});

test("validatePayload accepts valid pr_date_iso_raw", () => {
  assert.doesNotThrow(() => validatePayload({ pr_date_iso_raw: "2024-02-29" }));
});

test("validatePayload rejects invalid end_date_iso_raw", () => {
  rejectsPath({ end_date_iso_raw: "2023-02-29" }, "end_date_iso_raw");
});

test("validatePayload allows empty pr_date_iso_raw", () => {
  assert.doesNotThrow(() => validatePayload({ pr_date_iso_raw: "" }));
});
