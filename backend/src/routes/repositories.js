const express = require("express");

const { db } = require("../db");
const { validateRepositoryUrl } = require("../validation/validateRepositoryUrl");

const router = express.Router();

router.post("/", (req, res) => {
  const { url } = req.body;

  const validationResult = validateRepositoryUrl(url);

  if (!validationResult.valid) {
    return res.status(400).json({
      error: validationResult.message,
    });
  }

  try {
    const result = db
      .prepare("INSERT INTO repositories (url) VALUES (?)")
      .run(validationResult.normalizedUrl);

    const repository = db
      .prepare("SELECT * FROM repositories WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(repository);
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        error: "Repository URL already exists",
      });
    }

    res.status(500).json({
      error: "Failed to create repository",
    });
  }
});

router.get("/", (req, res) => {
  const repositories = db
    .prepare("SELECT * FROM repositories ORDER BY created_at DESC")
    .all();

  res.json(repositories);
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const result = db
    .prepare("DELETE FROM repositories WHERE id = ?")
    .run(id);

  if (result.changes === 0) {
    return res.status(404).json({
      error: "Repository not found",
    });
  }

  res.json({
    message: "Repository deleted successfully",
  });
});

module.exports = router;