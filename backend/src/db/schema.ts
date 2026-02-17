import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbDir = path.join(__dirname, "..", "..", "data");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const dbPath = process.env.DATABASE_PATH || path.join(dbDir, "finance.db");

export const db = new Database(dbPath);

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_fees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      year INTEGER NOT NULL,
      paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, year)
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_user_fees_user_year ON user_fees(user_id, year);

    CREATE TABLE IF NOT EXISTS deposits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      payment_method TEXT NOT NULL,
      payment_id TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS allocations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      deposit_id INTEGER,
      instrument_type TEXT NOT NULL,
      instrument_name TEXT NOT NULL,
      amount REAL NOT NULL,
      expected_return REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (deposit_id) REFERENCES deposits(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      read_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_deposits_user ON deposits(user_id);
    CREATE INDEX IF NOT EXISTS idx_allocations_user ON allocations(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  `);
}
