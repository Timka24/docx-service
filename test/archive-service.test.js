const test = require("node:test");
const assert = require("node:assert/strict");

const { HttpError, saveArchive } = require("../lib/archive-service");

function createMockDb() {
  const state = {
    nextId: 3,
    archives: [
      { id: 1, kv_num: "100-26-111", data: {}, raw_data: {}, updated_at: 1 },
      { id: 2, kv_num: "100-26-222", data: {}, raw_data: {}, updated_at: 1 },
    ],
  };

  function doQuery(sql, params) {
    const normalized = sql.replace(/\s+/g, " ").trim().toLowerCase();

    if (normalized.startsWith("select id, kv_num from archives where id = $1")) {
      const row = state.archives.find((a) => a.id === Number(params[0]));
      return { rows: row ? [{ id: row.id, kv_num: row.kv_num }] : [] };
    }

    if (normalized.startsWith("update archives") && normalized.includes("where id = $4")) {
      const id = Number(params[3]);
      const row = state.archives.find((a) => a.id === id);
      if (!row) return { rows: [] };

      const nextKv = params[2];
      if (nextKv && state.archives.some((a) => a.id !== id && a.kv_num === nextKv)) {
        const err = new Error("duplicate key value violates unique constraint");
        err.code = "23505";
        throw err;
      }

      row.data = params[0];
      row.raw_data = params[1];
      row.kv_num = nextKv;
      row.updated_at += 1;
      return { rows: [{ id: row.id }] };
    }

    if (normalized.startsWith("insert into archives")) {
      const kvNum = params[2];
      if (kvNum && state.archives.some((a) => a.kv_num === kvNum)) {
        const err = new Error("duplicate key value violates unique constraint");
        err.code = "23505";
        throw err;
      }

      const row = {
        id: state.nextId,
        kv_num: kvNum,
        data: params[0],
        raw_data: params[1],
        updated_at: 1,
      };
      state.nextId += 1;
      state.archives.push(row);
      return { rows: [{ id: row.id }] };
    }

    if (["begin", "commit", "rollback"].includes(normalized)) {
      return { rows: [] };
    }

    throw new Error(`Unexpected SQL: ${sql}`);
  }

  const client = {
    query: async (sql, params = []) => doQuery(sql, params),
    release: () => {},
  };

  return {
    state,
    query: async (sql, params = []) => doQuery(sql, params),
    connect: async () => client,
  };
}

test("saveArchive creates a new archive in create mode", async () => {
  const pool = createMockDb();

  const saved = await saveArchive(pool, { kv_num: "100-26-333", brig: "new" });

  assert.equal(saved.archiveId, 3);
  assert.equal(pool.state.archives.length, 3);
});

test("saveArchive returns 409 when kv_num already exists in create mode", async () => {
  const pool = createMockDb();

  await assert.rejects(
    () => saveArchive(pool, { kv_num: "100-26-111" }),
    (error) => error instanceof HttpError && error.status === 409 && error.message === "kv_num_exists"
  );
});

test("saveArchive updates existing archive when archive_id is provided and kv_num is unchanged", async () => {
  const pool = createMockDb();

  const saved = await saveArchive(pool, { archive_id: 1, kv_num: "100-26-111", brig: "updated" });

  assert.equal(saved.archiveId, 1);
  assert.equal(pool.state.archives.find((a) => a.id === 1).raw_data.brig, "updated");
  assert.equal(pool.state.archives.length, 2);
});

test("saveArchive creates a new archive when kv_num changed in edit mode", async () => {
  const pool = createMockDb();

  const saved = await saveArchive(pool, { archive_id: 1, kv_num: "100-26-444", brig: "copied" });

  assert.equal(saved.archiveId, 3);
  assert.equal(pool.state.archives.length, 3);
  assert.equal(pool.state.archives.find((a) => a.id === 1).kv_num, "100-26-111");
});