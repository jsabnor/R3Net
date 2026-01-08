import Database from 'better-sqlite3';

let db;

export async function initDB(path) {
  db = new Database(path);

  // Crear tablas si no existen
  db.exec(`
    CREATE TABLE IF NOT EXISTS routes (
      indicativo TEXT PRIMARY KEY,
      via TEXT,
      next_hop TEXT,
      last_seen INTEGER
    );

    CREATE TABLE IF NOT EXISTS storeforward (
      id TEXT PRIMARY KEY,
      from_user TEXT,
      to_user TEXT,
      payload TEXT,
      timestamp INTEGER,
      priority TEXT DEFAULT 'normal',
      retries INTEGER DEFAULT 0,
      max_retries INTEGER DEFAULT 5
    );

    CREATE TABLE IF NOT EXISTS users (
      indicativo TEXT PRIMARY KEY,
      pubkey TEXT NOT NULL,
      registered_at INTEGER,
      last_seen INTEGER,
      telegram_id TEXT
    );
  `);

  console.log('Base de datos global inicializada');
}

export async function getRoutes() {
  const stmt = db.prepare('SELECT * FROM routes');
  return stmt.all();
}

export async function updateRoute(indicativo, via, nextHop, lastSeen) {
  const stmt = db.prepare(
    'INSERT OR REPLACE INTO routes (indicativo, via, next_hop, last_seen) VALUES (?, ?, ?, ?)'
  );
  stmt.run(indicativo, via, nextHop, lastSeen);
}

export async function getStoreForward() {
  const stmt = db.prepare('SELECT * FROM storeforward WHERE retries < max_retries');
  return stmt.all();
}

export async function addStoreForward(id, fromUser, toUser, payload, timestamp, priority = 'normal') {
  const stmt = db.prepare(
    'INSERT INTO storeforward (id, from_user, to_user, payload, timestamp, priority) VALUES (?, ?, ?, ?, ?, ?)'
  );
  stmt.run(id, fromUser, toUser, payload, timestamp, priority);
}

export async function incrementRetries(id) {
  const stmt = db.prepare('UPDATE storeforward SET retries = retries + 1 WHERE id = ?');
  stmt.run(id);
}

export async function removeStoreForward(id) {
  const stmt = db.prepare('DELETE FROM storeforward WHERE id = ?');
  stmt.run(id);
}

// Funciones para usuarios
export async function registerUser(indicativo, pubkey, telegramId = null) {
  const now = Math.floor(Date.now() / 1000);
  const stmt = db.prepare(
    'INSERT OR REPLACE INTO users (indicativo, pubkey, registered_at, last_seen, telegram_id) VALUES (?, ?, ?, ?, ?)'
  );
  stmt.run(indicativo, pubkey, now, now, telegramId);
}

export async function getUser(indicativo) {
  const stmt = db.prepare('SELECT * FROM users WHERE indicativo = ?');
  return stmt.get(indicativo);
}

export async function getAllUsers() {
  const stmt = db.prepare('SELECT indicativo, pubkey, registered_at, last_seen FROM users');
  return stmt.all();
}

export async function updateUserLastSeen(indicativo) {
  const now = Math.floor(Date.now() / 1000);
  const stmt = db.prepare('UPDATE users SET last_seen = ? WHERE indicativo = ?');
  stmt.run(now, indicativo);
}