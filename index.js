const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const formRouter = require("./routes/form");
const createGenerateRouter = require("./routes/generate");
const createArchiveRouter = require("./routes/archive");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query("select 1").catch((err) => {
  console.error("DB connect error:", err);
  process.exit(1);
});

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", formRouter);
app.use("/", createGenerateRouter(pool));
app.use("/", createArchiveRouter(pool));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://0.0.0.0:${PORT}/form`);
});
