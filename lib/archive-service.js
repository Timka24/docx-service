const { buildTemplateData } = require("./template-data");

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function normalizeKvNum(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function isKvNumUniqueError(error) {
  return error && error.code === "23505";
}

async function insertArchive(poolOrClient, tplData, rawData, kvNum) {
  const ins = await poolOrClient.query(
    `insert into archives (data, raw_data, kv_num, stored, docx_key, updated_at)
     values ($1, $2, $3, false, null, now())
     returning id`,
    [tplData, rawData, kvNum]
  );

  return { archiveId: ins.rows[0].id };
}

async function saveArchive(pool, payload) {
  const rawData = payload || {};
  const tplData = buildTemplateData(rawData);
  const kvNum = normalizeKvNum(rawData.kv_num);
  const requestedArchiveId = Number(rawData.archive_id || rawData.id);

  if (Number.isInteger(requestedArchiveId) && requestedArchiveId > 0) {
    const client = await pool.connect();
    try {
      await client.query("begin");

      const existing = await client.query("select id, kv_num from archives where id = $1", [requestedArchiveId]);
      const currentArchive = existing.rows[0];

      if (!currentArchive) {
        throw new HttpError(404, "archive_not_found");
      }

      const currentKvNum = normalizeKvNum(currentArchive.kv_num);
      if (kvNum !== currentKvNum) {
        const created = await insertArchive(client, tplData, rawData, kvNum);
        await client.query("commit");
        return created;
      }

      const upd = await client.query(
        `update archives
            set data = $1,
                raw_data = $2,
                kv_num = $3,
                updated_at = now()
          where id = $4
        returning id`,
        [tplData, rawData, kvNum, requestedArchiveId]
      );

      await client.query("commit");
      return { archiveId: upd.rows[0].id };
    } catch (error) {
      await client.query("rollback");
      if (isKvNumUniqueError(error)) {
        throw new HttpError(409, "kv_num_exists");
      }
      throw error;
    } finally {
      client.release();
    }
  }

  try {
    return await insertArchive(pool, tplData, rawData, kvNum);
  } catch (error) {
    if (isKvNumUniqueError(error)) {
      throw new HttpError(409, "kv_num_exists");
    }
    throw error;
  }
}


async function createRenderVersion(pool, archiveId) {
  const normalizedArchiveId = Number(archiveId);
  if (!Number.isInteger(normalizedArchiveId) || normalizedArchiveId <= 0) {
    throw new HttpError(400, "invalid_archive_id");
  }

  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("select pg_advisory_xact_lock($1::bigint)", [normalizedArchiveId]);

    const archive = await client.query("select id, kv_num from archives where id = $1", [normalizedArchiveId]);
    if (!archive.rows[0]) {
      throw new HttpError(404, "archive_not_found");
    }

    if (typeof archive.rows[0].kv_num !== "string" || archive.rows[0].kv_num.trim() === "") {
      throw new HttpError(400, "kv_num_required_for_render");
    }

    const versionQuery = await client.query(
      "select coalesce(max(version), 0) + 1 as next_version from archive_renders where archive_id = $1",
      [normalizedArchiveId]
    );
    const nextVersion = versionQuery.rows[0].next_version;

    const ins = await client.query(
      `insert into archive_renders (archive_id, version, docx_status, pdf_status)
       values ($1, $2, 'pending', 'pending')
       returning id, version`,
      [normalizedArchiveId, nextVersion]
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