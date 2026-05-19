const test = require("node:test");
const assert = require("node:assert/strict");

const { HttpError, saveArchive, createRenderVersion } = require("../lib/archive-service");

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

function createRenderMockDb(initialRenders = []) {
  const state = {
    nextRenderId: initialRenders.reduce((max, row) => Math.max(max, row.id), 0) + 1,
    archives: [
      { id: 1, kv_num: "100-26-111" },
    ],
    renders: initialRenders.map((row) => ({ ...row })),
  };

  function doQuery(sql, params) {
    const normalized = sql.replace(/\s+/g, " ").trim().toLowerCase();

    if (["begin", "commit", "rollback"].includes(normalized)) {
      return { rows: [] };
    }

    if (normalized.startsWith("select pg_advisory_xact_lock")) {
      return { rows: [] };
    }

    if (normalized.startsWith("select id, kv_num from archives where id = $1")) {
      const row = state.archives.find((archive) => archive.id === Number(params[0]));
      return { rows: row ? [{ id: row.id, kv_num: row.kv_num }] : [] };
    }

    if (
      normalized.startsWith("select id, version from archive_renders")
      && normalized.includes("docx_status = 'pending'")
      && normalized.includes("pdf_status = 'pending'")
    ) {
      const rows = state.renders
        .filter((render) => (
          render.archive_id === Number(params[0])
          && (render.docx_status === "pending" || render.pdf_status === "pending")
        ))
        .sort((a, b) => b.version - a.version)
        .map((render) => ({ id: render.id, version: render.version }));
      return { rows: rows.slice(0, 1) };
    }

    if (normalized.startsWith("select coalesce(max(version), 0) + 1 as next_version from archive_renders")) {
      const versions = state.renders
        .filter((render) => render.archive_id === Number(params[0]))
        .map((render) => render.version);
      return { rows: [{ next_version: versions.length ? Math.max(...versions) + 1 : 1 }] };
    }

    if (normalized.startsWith("insert into archive_renders")) {
      const row = {
        id: state.nextRenderId,
        archive_id: Number(params[0]),
        version: Number(params[1]),
        docx_status: "pending",
        pdf_status: "pending",
      };
      state.nextRenderId += 1;
      state.renders.push(row);
      return { rows: [{ id: row.id, version: row.version }] };
    }

    throw new Error(`Unexpected SQL: ${sql}`);
  }

  const client = {
    query: async (sql, params = []) => doQuery(sql, params),
    release: () => {},
  };

  return {
    state,
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

test("createRenderVersion returns existing pending DOCX render", async () => {
  const pool = createRenderMockDb([
    { id: 10, archive_id: 1, version: 1, docx_status: "pending", pdf_status: "pending" },
  ]);

  const render = await createRenderVersion(pool, 1);

  assert.deepEqual(render, { renderId: 10, version: 1, alreadyPending: true });
  assert.equal(pool.state.renders.length, 1);
});

test("createRenderVersion returns existing pending PDF render", async () => {
  const pool = createRenderMockDb([
    { id: 11, archive_id: 1, version: 1, docx_status: "ready", pdf_status: "pending" },
  ]);

  const render = await createRenderVersion(pool, 1);

  assert.deepEqual(render, { renderId: 11, version: 1, alreadyPending: true });
  assert.equal(pool.state.renders.length, 1);
});

test("createRenderVersion creates new version after failed render", async () => {
  const pool = createRenderMockDb([
    { id: 12, archive_id: 1, version: 1, docx_status: "failed", pdf_status: "failed" },
  ]);

  const render = await createRenderVersion(pool, 1);

  assert.deepEqual(render, { renderId: 13, version: 2, alreadyPending: false });
  assert.equal(pool.state.renders.length, 2);
});

test("createRenderVersion creates new version after ready render", async () => {
  const pool = createRenderMockDb([
    { id: 14, archive_id: 1, version: 1, docx_status: "ready", pdf_status: "ready" },
  ]);

  const render = await createRenderVersion(pool, 1);

  assert.deepEqual(render, { renderId: 15, version: 2, alreadyPending: false });
  assert.equal(pool.state.renders.length, 2);
});
