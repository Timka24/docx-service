const { buildTemplateData } = require("./template-data");

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function saveArchive(pool, payload) {
  const rawData = payload || {};
  const tplData = buildTemplateData(rawData);
  const kvNum = typeof rawData.kv_num === "string" && rawData.kv_num.trim() !== ""
    ? rawData.kv_num.trim()
    : null;
  const requestedArchiveId = Number(rawData.archive_id || rawData.id);

  if (!Number.isNaN(requestedArchiveId) && requestedArchiveId > 0) {
    const upd = await pool.query(
      `update archives
          set data = $1,
              raw_data = $2,
              kv_num = $3,
              updated_at = now()
        where id = $4
      returning id`,
      [tplData, rawData, kvNum, requestedArchiveId]
    );

    if (!upd.rows[0]) {
      throw new HttpError(404, "archive_not_found");
    }

    return { archiveId: upd.rows[0].id };
  }

  const ins = await pool.query(
    `insert into archives (data, raw_data, kv_num, stored, docx_key, updated_at)
     values ($1, $2, $3, false, null, now())
     returning id`,
    [tplData, rawData, kvNum]
  );

  return { archiveId: ins.rows[0].id };
}

async function createRenderVersion(pool, archiveId) {
  const archive = await pool.query("select id, kv_num from archives where id = $1", [archiveId]);
  if (!archive.rows[0]) {
    throw new HttpError(404, "archive_not_found");
  }

  if (typeof archive.rows[0].kv_num !== "string" || archive.rows[0].kv_num.trim() === "") {
    throw new HttpError(400, "kv_num_required_for_render");
  }

  const client = await pool.connect();
  try {
    await client.query("begin");

    const versionQuery = await client.query(
      "select coalesce(max(version), 0) + 1 as next_version from archive_renders where archive_id = $1",
      [archiveId]
    );
    const nextVersion = versionQuery.rows[0].next_version;

    const ins = await client.query(
      `insert into archive_renders (archive_id, version, docx_status, pdf_status)
       values ($1, $2, 'pending', 'pending')
       returning id, version`,
      [archiveId, nextVersion]
    );

    await client.query("commit");
    return { renderId: ins.rows[0].id, version: ins.rows[0].version };
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
}

module.exports = {
  HttpError,
  saveArchive,
  createRenderVersion,
};