// c:/Users/sande/OneDrive/Desktop/Linkedin - project/postcraft-ai/backend/db.js
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'postcraft.db');
const db = new Database(dbPath, { verbose: console.log });

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize schema
function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      google_id TEXT,
      name TEXT,
      email TEXT UNIQUE,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      model_name TEXT,
      api_key TEXT,
      UNIQUE(user_id, model_name),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT,
      raw_input TEXT,
      generated_post TEXT,
      model_used TEXT,
      viral_score INTEGER,
      viral_breakdown JSON,
      hashtags JSON,
      length_type TEXT,
      tone_value INTEGER,
      cta_styles JSON,
      best_time TEXT,
      best_time_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS drafts (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT,
      raw_input TEXT,
      post_content TEXT,
      model_used TEXT,
      settings JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

initDB();

module.exports = db;
