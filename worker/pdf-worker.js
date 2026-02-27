const fs = require("fs/promises");
const path = require("path");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DOCX_DIR = process.env.DOCX_DIR || path.join(__dirname, "..", "storage", "docx");
const PDF_DIR = process.env.PDF_DIR || path.join(__dirname, "..", "storage", "pdf");
const GOTENBERG_URL = process.env.GOTENBERG_URL || "http://gotenberg:3000";
const GOTENBERG_LIBREOFFICE_ENDPOINT = process.env.GOTENBERG_LIBREOFFICE_ENDPOINT || "/forms/libreoffice/convert";

const WORKER_POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_INTERVAL_MS || 3000);
const WORKER_BATCH_SIZE = Number(process.env.WORKER_BATCH_SIZE || 1);
const BACKOFF_MS = [5000, 30000, 120000];
const MAX_ATTEMPTS = BACKOFF_MS.length;
const MAX_ERROR_LENGTH = 1000;
const REQUEST_TIMEOUT_MS = Number(process.env.PDF_CONVERT_TIMEOUT_MS || 60000);
const MAX_PDF_BYTES = Number(process.env.MAX_PDF_BYTES || 30 * 1024 * 1024);

const RU_MONTHS = [
  "январь",
  "февраль",
  "март",
  "апрель",
  "май",
  "июнь",
  "июль",
  "август",
  "сентябрь",
  "октябрь",
  "ноябрь",
  "декабрь",
];

class TemporaryPdfError extends Error {
  constructor(message) {
    super(message);
    this.name = "TemporaryPdfError";
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeErrorText(error) {
  const text = error?.message || String(error);
  return text.slice(0, MAX_ERROR_LENGTH);
}

function parseDateForPdfPath(value) {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const [, yyyy, mm, dd] = iso;
    const month = Number(mm);
    const day = Number(dd);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { yyyy, mm, dd };
    }
  }

  const ru = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (ru) {
    const [, dd, mm, yyyy] = ru;
    const month = Number(mm);
    const day = Number(dd);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { yyyy, mm, dd };
    }
  }

  return null;
}

function buildPdfKey(parts, kvNum) {
  const monthIndex = Number(parts.mm) - 1;
  const monthName = RU_MONTHS[monthIndex];
  if (!monthName) {
    throw new Error(`invalid_month:${parts.mm}`);
  }
  return `${parts.yyyy}/${monthName}/${parts.dd}/${kvNum}.pdf`;
}

async function writeAtomic(baseDir, relKey, buffer) {
  const targetPath = path.join(baseDir, relKey);
  const targetDir = path.dirname(targetPath);
  const tmpPath = `${targetPath}.${process.pid}.${Date.now()}.tmp`;

  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(tmpPath, buffer);
  await fs.rename(tmpPath, targetPath);
}

async function readBodyWithLimit(response) {
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > MAX_PDF_BYTES) {
    throw new TemporaryPdfError(`pdf_too_large:${contentLength}`);
  }

  if (!response.body || !response.body.getReader) {
    const ab = await response.arrayBuffer();
    if (ab.byteLength > MAX_PDF_BYTES) {
      throw new TemporaryPdfError(`pdf_too_large:${ab.byteLength}`);
    }
    return Buffer.from(ab);
  }

  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = Buffer.from(value);
    total += chunk.length;
    if (total > MAX_PDF_BYTES) {
      throw new TemporaryPdfError(`pdf_too_large:${total}`);
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

async function convertDocxToPdf(docxAbsPath) {
  const docxBuffer = await fs.readFile(docxAbsPath);
  const form = new FormData();
  form.set(
    "files",
    new Blob([docxBuffer], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }),
    "document.docx"
  );

  const endpoint = new URL(GOTENBERG_LIBREOFFICE_ENDPOINT, GOTENBERG_URL).toString();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: form,
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status >= 500) {
        throw new TemporaryPdfError(`gotenberg_5xx:${response.status}`);
      }
      throw new Error(`gotenberg_bad_status:${response.status}`);
    }

    return await readBodyWithLimit(response);
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new TemporaryPdfError(`gotenberg_timeout:${REQUEST_TIMEOUT_MS}`);
    }
    if (error instanceof TemporaryPdfError) {
      throw error;
    }
    throw new TemporaryPdfError(error?.message || String(error));
  } finally {
    clearTimeout(timeoutId);
  }
}

async function pickPendingPdfRender(client) {
  const picked = await client.query(
    `select id,
            archive_id,
            version,
            docx_key,
            coalesce(pdf_attempts, 0) as pdf_attempts
       from archive_renders
      where docx_status = 'ready'
        and pdf_status = 'pending'
        and (pdf_next_attempt_at is null or pdf_next_attempt_at <= now())
      order by created_at asc
      for update skip locked
      limit 1`
  );

  return picked.rows[0] || null;
}

function resolvePrDateParts(archive) {
  return (
    parseDateForPdfPath(archive?.data?.pr_date_iso)
    || parseDateForPdfPath(archive?.data?.pr_date)
    || parseDateForPdfPath(archive?.raw_data?.nowDate)
    || parseDateForPdfPath(archive?.raw_data?.pr_date)
  );
}

async function markFailed(client, renderId, errorCode) {
  await client.query(
    `update archive_renders
        set pdf_status = 'failed',
            pdf_error = $1,
            pdf_next_attempt_at = null
      where id = $2`,
    [safeErrorText(errorCode), renderId]
  );
}

async function handleTemporaryFailure(client, renderId, attemptsDone, error) {
  const msg = safeErrorText(error);
  if (attemptsDone >= MAX_ATTEMPTS) {
    await client.query(
      `update archive_renders
          set pdf_status = 'failed',
              pdf_error = $1,
              pdf_attempts = $2,
              pdf_next_attempt_at = null
        where id = $3`,
      [msg, attemptsDone, renderId]
    );
    return;
  }

  const retryAt = new Date(Date.now() + BACKOFF_MS[attemptsDone - 1]);
  await client.query(
    `update archive_renders
        set pdf_status = 'pending',
            pdf_error = $1,
            pdf_attempts = $2,
            pdf_next_attempt_at = $3
      where id = $4`,
    [msg, attemptsDone, retryAt.toISOString(), renderId]
  );
}

async function processOneRender() {
  const client = await pool.connect();

  try {
    await client.query("begin");

    const render = await pickPendingPdfRender(client);
    if (!render) {
      await client.query("commit");
      return false;
    }

    console.log(`Processing PDF for render #${render.id} (archive ${render.archive_id}, version ${render.version})`);

    const archiveRes = await client.query(
      "select kv_num, data, raw_data from archives where id = $1",
      [render.archive_id]
    );
    const archive = archiveRes.rows[0];
    if (!archive) {
      await markFailed(client, render.id, `archive_not_found:${render.archive_id}`);
      await client.query("commit");
      return true;
    }

    const kvNum = typeof archive.kv_num === "string" ? archive.kv_num.trim() : "";
    if (!kvNum) {
      await markFailed(client, render.id, "kv_num_required_for_pdf");
      await client.query("commit");
      return true;
    }

    const prDateParts = resolvePrDateParts(archive);
    if (!prDateParts) {
      await markFailed(client, render.id, "pr_date_required_for_pdf_path");
      await client.query("commit");
      return true;
    }

    if (typeof render.docx_key !== "string" || !render.docx_key.trim()) {
      const attemptsDone = Number(render.pdf_attempts || 0) + 1;
      await handleTemporaryFailure(client, render.id, attemptsDone, new TemporaryPdfError("docx_key_missing"));
      await client.query("commit");
      return true;
    }

    const docxPath = path.join(DOCX_DIR, render.docx_key);

    try {
      const pdfBuffer = await convertDocxToPdf(docxPath);
      const pdfKey = buildPdfKey(prDateParts, kvNum);

      await writeAtomic(PDF_DIR, pdfKey, pdfBuffer);

      await client.query(
        `update archive_renders
            set pdf_status = 'ready',
                pdf_key = $1,
                pdf_error = null,
                pdf_next_attempt_at = null
          where id = $2`,
        [pdfKey, render.id]
      );

      await client.query("commit");
      console.log(`Render #${render.id} PDF ready, pdf_key=${pdfKey}`);
      return true;
    } catch (error) {
      const attemptsDone = Number(render.pdf_attempts || 0) + 1;

      if (error?.code === "ENOENT") {
        await handleTemporaryFailure(client, render.id, attemptsDone, new TemporaryPdfError("docx_file_not_found"));
      } else {
        await handleTemporaryFailure(client, render.id, attemptsDone, error);
      }

      await client.query("commit");
      console.error(`Render #${render.id} PDF failed: ${safeErrorText(error)}`);
      return true;
    }
  } catch (error) {
    try {
      await client.query("rollback");
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }

    console.error("PDF worker DB cycle failed:", error);
    return false;
  } finally {
    client.release();
  }
}

let stopRequested = false;

async function runWorker() {
  console.log("PDF worker started");

  while (!stopRequested) {
    for (let i = 0; i < WORKER_BATCH_SIZE; i += 1) {
      if (stopRequested) break;
      try {
        await processOneRender();
      } catch (error) {
        console.error("Unexpected PDF worker task error:", error);
      }
    }

    if (!stopRequested) {
      await sleep(WORKER_POLL_INTERVAL_MS);
    }
  }

  await pool.end();
  console.log("PDF worker stopped");
}

process.on("SIGTERM", () => {
  stopRequested = true;
});

process.on("SIGINT", () => {
  stopRequested = true;
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection in PDF worker:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception in PDF worker:", error);
});

runWorker().catch((error) => {
  console.error("PDF worker fatal startup error:", error);
  process.exit(1);
});
