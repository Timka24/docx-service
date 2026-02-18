const path = require("path");
const express = require("express");
const router = express.Router();

router.get("/form", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "form.html"));
});

module.exports = router;
