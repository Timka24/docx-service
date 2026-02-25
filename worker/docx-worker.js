const fs = require("fs/promises");
const path = require("path");
const { Pool } = require("pg");
const { renderDocx } = require("../lib/docx-render");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DOCX_DIR = process.env.DOCX_DIR || path.join(__dirname, "..", "storage", "docx");
const WORKER_POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_INTERVAL_MS || 3000);
const WORKER_BATCH_SIZE = Number(process.env.WORKER_BATCH_SIZE || 1);
const MAX_ERROR_LENGTH = 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeErrorText(error) {
  const text = error?.message || String(error);
  return text.slice(0, MAX_ERROR_LENGTH);
}

function formatDateParts(dateValue) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid created_at: ${dateValue}`);
  }

  const yyyy = String(d.getUTCFullYear());
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return { yyyy, mm, dd };
}

function buildDocxKey(render) {
  const { yyyy, mm, dd } = formatDateParts(render.created_at);
  return `${yyyy}/${mm}/${dd}/${render.archive_id}/v${render.version}.docx`;
}

async function writeAtomic(baseDir, relKey, buffer) {
  const targetPath = path.join(baseDir, relKey);
  const targetDir = path.dirname(targetPath);
  const tmpPath = `${targetPath}.${process.pid}.${Date.now()}.tmp`;

  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(tmpPath, buffer);
  await fs.rename(tmpPath, targetPath);
}

async function pickPendingRender(client) {
  const picked = await client.query(
    `select id, archive_id, version, created_at
       from archive_renders
      where docx_status = 'pending'
      order by created_at asc
      for update skip locked
      limit 1`
  );

  return picked.rows[0] || null;
}

async function processOneRender() {
  const client = await pool.connect();

  try {
    await client.query("begin");

    const render = await pickPendingRender(client);
    if (!render) {
      await client.query("commit");
      return false;
    }

    console.log(`Processing render #${render.id} (archive ${render.archive_id}, version ${render.version})`);

    try {
      const archiveRes = await client.query("select data from archives where id = $1", [render.archive_id]);
      const archive = archiveRes.rows[0];
      if (!archive) {
        throw new Error(`archive_not_found:${render.archive_id}`);
      }

      const docxBuffer = renderDocx(archive.data || {});
      const docxKey = buildDocxKey(render);

      await writeAtomic(DOCX_DIR, docxKey, docxBuffer);

      await client.query(
        `update archive_renders
            set docx_status = 'ready',
                docx_key = $1,
                docx_error = null
          where id = $2`,
        [docxKey, render.id]
      );

      await client.query("commit");
      console.log(`Render #${render.id} completed, docx_key=${docxKey}`);
      return true;
    } catch (error) {
      const msg = safeErrorText(error);

      await client.query(
        `update archive_renders
            set docx_status = 'failed',
                docx_error = $1
          where id = $2`,
        [msg, render.id]
      );

      await client.query("commit");
      console.error(`Render #${render.id} failed: ${msg}`);
      return true;
    }
  } catch (error) {
    try {
      await client.query("rollback");
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }

    console.error("Worker DB cycle failed:", error);
    return false;
  } finally {
    client.release();
  }
}

async function runWorker() {
  console.log("DOCX worker started");

  // eslint-disable-next-line no-constant-condition
  while (true) {
    for (let i = 0; i < WORKER_BATCH_SIZE; i += 1) {
      try {
        await processOneRender();
      } catch (error) {
        console.error("Unexpected worker task error:", error);
      }
    }

    await sleep(WORKER_POLL_INTERVAL_MS);
  }
}

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection in DOCX worker:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception in DOCX worker:", error);
});

runWorker().catch((error) => {
  console.error("DOCX worker fatal startup error:", error);
  process.exit(1);
});