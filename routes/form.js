const path = require("path");
const express = require("express");
const router = express.Router();

router.get("/form", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "form.html"));
});

router.get("/archive", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "archive.html"));
});

router.get("/archive/:archiveId(\\d+)", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "archive-card.html"));
});

module.exports = router;
