const test = require("node:test");
const assert = require("node:assert/strict");

const { ValidationError, validatePayload } = require("../lib/validation");

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
