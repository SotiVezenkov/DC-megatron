const Database = require("better-sqlite3");

const db = new Database("database.sqlite");

function initializeDatabase() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS repositories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

module.exports = {
  db,
  initializeDatabase,
};