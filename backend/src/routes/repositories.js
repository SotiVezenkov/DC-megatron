const express = require("express");

const { db } = require("../db");
const { validateRepositoryUrl } = require("../validation/validateRepositoryUrl");
const { checkGitHubAccess } = require("../validation/githubAccessCheck");

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
      .prepare(`
        SELECT
          repositories.id,
          repositories.url,
          repositories.secret_id,
          secrets.name AS secret_name,
          repositories.created_at
        FROM repositories
        LEFT JOIN secrets ON repositories.secret_id = secrets.id
        WHERE repositories.id = ?
      `)
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
    .prepare(`
      SELECT
        repositories.id,
        repositories.url,
        repositories.secret_id,
        secrets.name AS secret_name,
        repositories.created_at
      FROM repositories
      LEFT JOIN secrets ON repositories.secret_id = secrets.id
      ORDER BY repositories.created_at DESC
    `)
    .all();

  res.json(repositories);
});

router.put("/:id/secret", (req, res) => {
  const { id } = req.params;
  const { secretId } = req.body;

  if (!secretId) {
    return res.status(400).json({
      error: "Secret ID is required",
    });
  }

  const repository = db
    .prepare("SELECT * FROM repositories WHERE id = ?")
    .get(id);

  if (!repository) {
    return res.status(404).json({
      error: "Repository not found",
    });
  }

  const secret = db
    .prepare("SELECT id, name FROM secrets WHERE id = ?")
    .get(secretId);

  if (!secret) {
    return res.status(404).json({
      error: "Secret not found",
    });
  }

  db.prepare("UPDATE repositories SET secret_id = ? WHERE id = ?").run(
    secretId,
    id
  );

  const updatedRepository = db
    .prepare(`
      SELECT
        repositories.id,
        repositories.url,
        repositories.secret_id,
        secrets.name AS secret_name,
        repositories.created_at
      FROM repositories
      LEFT JOIN secrets ON repositories.secret_id = secrets.id
      WHERE repositories.id = ?
    `)
    .get(id);

  res.json(updatedRepository);
});

router.post("/:id/validate-secret", async (req, res) => {
  const { id } = req.params;

  const repository = db
    .prepare("SELECT * FROM repositories WHERE id = ?")
    .get(id);

  if (!repository) {
    return res.status(404).json({
      error: "Repository not found",
    });
  }

  if (!repository.secret_id) {
    return res.status(400).json({
      error: "Repository does not have a linked secret",
    });
  }

  const secret = db
    .prepare("SELECT * FROM secrets WHERE id = ?")
    .get(repository.secret_id);

  if (!secret) {
    return res.status(404).json({
      error: "Linked secret not found",
    });
  }

  try {
    const validationResult = await checkGitHubAccess(repository, secret);

    res.json(validationResult);
  } catch (error) {
    res.status(500).json({
      error: "Failed to validate repository secret",
    });
  }
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