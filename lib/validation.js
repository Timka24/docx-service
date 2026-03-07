class ValidationError extends Error {
  constructor(details) {
    super("validation_error");
    this.name = "ValidationError";
    this.status = 400;
    this.code = "validation_error";
    this.details = details;
  }
}

const MAX_DEFAULT_TEXT = 2000;
const MAX_FIO_TEXT = 128;
const MAX_KV_NUM_LENGTH = 128;
const GRID_LENGTH = 70;

const HOUR_FIELDS = new Set([
  "pr_time_h",
  "pr_h",
  "d_h",
  "bio_d_h",
  "end_h",
  "end_transfer_doc_h",
  "end_transfer_team_h",
  "slr_h",
]);

const MINUTE_FIELDS = new Set([
  "pr_time_m",
  "pr_m",
  "d_m",
  "bio_d_m",
  "end_m",
  "end_transfer_doc_m",
  "end_transfer_team_m",
  "slr_m",
]);

//const DATE_FIELDS = new Set(["pr_date", "end_date"]);

const FIO_FIELDS = new Set(["fio_pac", "br_ruk", "ver_ruk", "end_transfer_doc_fio"]);

const LONG_TEXT_FIELDS = new Set([
  "comments",
  "reversible_causes_4g4t",
  "post_resuscitation_therapy",
  "end_conclusion",
  "slr_oth_txt",
]);

const NUMERIC_GRID_FIELDS = new Set(["ch_adr_nacl_ml_marks", "ch_amio_glu_ml_marks"]);
const ENERGY_GRID_FIELDS = new Set(["ch_defib_j_marks"]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// function isValidDateString(value) {
//   if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
//   const d = new Date(`${value}T00:00:00Z`);
//   return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
// }

function pushTypeError(details, key, expected) {
  details.push({ path: key, message: `must be ${expected}` });
}

function validateTimeField(details, key, value, max) {
  if (value === "" || value === null || value === undefined) return;
  if (typeof value !== "string") {
    pushTypeError(details, key, "string");
    return;
  }

  const raw = value.trim();
  if (raw === "") return;
  if (!/^\d{1,2}$/.test(raw)) {
    details.push({ path: key, message: `must be 0..${max}` });
    return;
  }

  const num = Number(raw);
  if (!Number.isInteger(num) || num < 0 || num > max) {
    details.push({ path: key, message: `must be 0..${max}` });
  }
}

// function validateDateField(details, key, value) {
//   if (value === "" || value === null || value === undefined) return;
//   if (typeof value !== "string") {
//     pushTypeError(details, key, "string");
//     return;
//   }
//   if (!isValidDateString(value)) {
//     details.push({ path: key, message: "must be YYYY-MM-DD" });
//   }
// }

function validateGridField(details, key, value) {
  if (value === null || value === undefined) return;

  if (!Array.isArray(value)) {
    pushTypeError(details, key, "array[70]");
    return;
  }

  if (value.length !== GRID_LENGTH) {
    details.push({ path: key, message: "must have exactly 70 items" });
    return;
  }

  for (let idx = 0; idx < value.length; idx += 1) {
    const element = value[idx];
    const path = `${key}[${idx}]`;

    if (typeof element !== "string") {
      pushTypeError(details, path, "string");
      continue;
    }

    if (element.length > 8) {
      details.push({ path, message: "must be <= 8 chars" });
      continue;
    }

    if (NUMERIC_GRID_FIELDS.has(key) && element !== "") {
      if (element.length > 10) {
        details.push({ path, message: "must be <= 10 chars" });
      } else if (!/^\d+(?:[.,]\d+)?$/.test(element.trim())) {
        details.push({ path, message: "must be numeric string or empty" });
      }
      continue;
    }

    if (ENERGY_GRID_FIELDS.has(key) && element !== "") {
      if (element.length > 4) {
        details.push({ path, message: "must be <= 4 chars" });
      } else if (!/^\d+$/.test(element.trim())) {
        details.push({ path, message: "must be digits or empty" });
      }
    }
  }
}

function validateTextField(details, key, value, maxLength = MAX_DEFAULT_TEXT) {
  if (value === null || value === undefined) return;
  if (typeof value !== "string") {
    pushTypeError(details, key, "string");
    return;
  }
  if (value.length > maxLength) {
    details.push({ path: key, message: `must be <= ${maxLength} chars` });
  }
}

function validatePayload(payload) {
  const details = [];

  if (!isPlainObject(payload)) {
    throw new ValidationError([{ path: "$", message: "must be a JSON object" }]);
  }

  for (const [key, value] of Object.entries(payload)) {
    if (key === "archive_id" || key === "id") {
      if (value === "" || value === null || value === undefined) continue;
      if (!(typeof value === "number" || typeof value === "string")) {
        pushTypeError(details, key, "number|string");
      }
      continue;
    }

    if (key === "kv_num") {
      validateTextField(details, key, value, MAX_KV_NUM_LENGTH);
      continue;
    }

    // if (DATE_FIELDS.has(key)) {
    //   validateDateField(details, key, value);
    //   continue;
    // }

    if (HOUR_FIELDS.has(key)) {
      validateTimeField(details, key, value, 23);
      continue;
    }

    if (MINUTE_FIELDS.has(key)) {
      validateTimeField(details, key, value, 59);
      continue;
    }

    if (key === "ch_cpr_m" || key.endsWith("_marks")) {
      validateGridField(details, key, value);
      continue;
    }

    if (FIO_FIELDS.has(key)) {
      validateTextField(details, key, value, MAX_FIO_TEXT);
      continue;
    }

    if (LONG_TEXT_FIELDS.has(key)) {
      validateTextField(details, key, value, MAX_DEFAULT_TEXT);
      continue;
    }

    if (typeof value === "string" && value.length > MAX_DEFAULT_TEXT) {
      details.push({ path: key, message: `must be <= ${MAX_DEFAULT_TEXT} chars` });
    }
  }

  if (details.length > 0) {
    throw new ValidationError(details);
  }
}

module.exports = {
  ValidationError,
  validatePayload,
};
