import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.R3NET_DB_PATH || path.join(process.cwd(), 'r3net_regional.db');

export function initDB() {
  const db = new Database(DB_PATH);

  // Tabla de rutas regionales
  db.exec(`
    CREATE TABLE IF NOT EXISTS routes (
      indicativo TEXT PRIMARY KEY,
      via TEXT, -- 'local' o 'global'
      next_hop TEXT,
      last_seen INTEGER
    )
  `);

  // Tabla de store & forward regional
  db.exec(`
    CREATE TABLE IF NOT EXISTS store_forward (
      id TEXT PRIMARY KEY,
      message TEXT, -- JSON string
      timestamp INTEGER,
      priority TEXT DEFAULT 'normal',
      retries INTEGER DEFAULT 0
    )
  `);

  // Preparar statements
  db.getRoute = db.prepare('SELECT * FROM routes WHERE indicativo = ?');
  db.insertRoute = db.prepare('INSERT OR REPLACE INTO routes (indicativo, via, next_hop, last_seen) VALUES (?, ?, ?, ?)');
  db.deleteRoute = db.prepare('DELETE FROM routes WHERE indicativo = ?');
  db.getAllRoutes = db.prepare('SELECT * FROM routes');

  db.getSFMessage = db.prepare('SELECT * FROM store_forward WHERE id = ?');
  db.insertSFMessage = db.prepare('INSERT INTO store_forward (id, message, timestamp, priority) VALUES (?, ?, ?, ?)');
  db.deleteSFMessage = db.prepare('DELETE FROM store_forward WHERE id = ?');
  db.getPendingSF = db.prepare('SELECT * FROM store_forward ORDER BY timestamp ASC');
  db.incrementRetries = db.prepare('UPDATE store_forward SET retries = retries + 1 WHERE id = ?');

  console.log('Base de datos regional inicializada');
  return db;
}