const express = require("express");
const router = express.Router();

function createArchiveRouter(pool) {
  router.get("/archive", async (req, res) => {
    const r = await pool.query(
      "select id, created_at, stored from archives order by id desc limit 100"
    );
    res.json(r.rows);
  });

  router.get("/archive/:id", async (req, res) => {
    const id = Number(req.params.id);
    const r = await pool.query("select id, created_at, data from archives where id=$1", [id]);
    if (!r.rows[0]) return res.status(404).send("not found");
    res.json(r.rows[0]);
  });

  return router;
}

module.exports = createArchiveRouter;
