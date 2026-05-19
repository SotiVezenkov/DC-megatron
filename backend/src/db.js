const Database = require("better-sqlite3");

const db = new Database("database.sqlite");

function initializeDatabase() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS secrets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      encrypted_value TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS repositories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL UNIQUE,
      secret_id INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (secret_id) REFERENCES secrets(id) ON DELETE SET NULL
    )
  `).run();
}

module.exports = {
  db,
  initializeDatabase,
};