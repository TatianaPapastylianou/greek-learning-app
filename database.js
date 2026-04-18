import sqlite3 from 'sqlite3';

let db = null;

export async function initializeDatabase() {
  db = new sqlite3.Database('./greek_learning.db', (err) => {
    if (err) {
      console.error('Database connection error:', err);
    } else {
      console.log('Connected to SQLite database');
    }
  });

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create groups table
      db.run(`
        CREATE TABLE IF NOT EXISTS groups (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
      });

      // Create words table
      db.run(`
        CREATE TABLE IF NOT EXISTS words (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          group_id INTEGER NOT NULL,
          greek_word TEXT NOT NULL,
          english_translation TEXT NOT NULL,
          FOREIGN KEY(group_id) REFERENCES groups(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

// Helper function to run queries
export function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

// Helper function to get one row
export function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Helper function to get all rows
export function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export function getDatabase() {
  return db;
}
