const express = require("express");

const { db } = require("../db");
const { encryptSecret } = require("../services/encryptionService");

const router = express.Router();

router.post("/", (req, res) => {
  const { name, value } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({
      error: "Secret name is required",
    });
  }

  if (!value || typeof value !== "string") {
    return res.status(400).json({
      error: "Secret value is required",
    });
  }

  const trimmedName = name.trim();
  const trimmedValue = value.trim();

  if (!trimmedName) {
    return res.status(400).json({
      error: "Secret name cannot be empty",
    });
  }

  if (!trimmedValue) {
    return res.status(400).json({
      error: "Secret value cannot be empty",
    });
  }

  try {
    const encryptedValue = encryptSecret(trimmedValue);

    const result = db
      .prepare("INSERT INTO secrets (name, encrypted_value) VALUES (?, ?)")
      .run(trimmedName, encryptedValue);

    const secret = db
      .prepare("SELECT id, name, created_at FROM secrets WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(secret);
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        error: "Secret name already exists",
      });
    }

    res.status(500).json({
      error: "Failed to create secret",
    });
  }
});

router.get("/", (req, res) => {
  const secrets = db
    .prepare("SELECT id, name, created_at FROM secrets ORDER BY created_at DESC")
    .all();

  res.json(secrets);
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const result = db.prepare("DELETE FROM secrets WHERE id = ?").run(id);

  if (result.changes === 0) {
    return res.status(404).json({
      error: "Secret not found",
    });
  }

  res.json({
    message: "Secret deleted successfully",
  });
});

module.exports = router;