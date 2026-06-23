import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

let dbPromise: Promise<Database> | null = null;

function getDbPath() {
  return process.env.BRAIN_DB_PATH || path.join(process.cwd(), 'brain.db');
}

async function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const SQL = await initSqlJs({ locateFile: file => require.resolve('sql.js/dist/' + file) });
      const dbPath = getDbPath();
      if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        return new SQL.Database(fileBuffer);
      }
      return new SQL.Database();
    })();
  }
  return dbPromise;
}

async function persistDb(db: Database) {
  const dbPath = getDbPath();
  if (dbPath === ':memory:') return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function embed(text: string): number[] {
  const vec = [0, 0, 0];
  for (let i = 0; i < text.length; i++) {
    vec[i % 3] += text.charCodeAt(i);
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map(v => v / norm);
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / ((Math.sqrt(na) * Math.sqrt(nb)) || 1);
}

export async function storeEmbedding(text: string, metadata: Record<string, any>) {
  const db = await getDb();
  db.run(`CREATE TABLE IF NOT EXISTS embeddings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT,
    metadata TEXT,
    vector TEXT
  );`);
  const vector = embed(text);
  const stmt = db.prepare('INSERT INTO embeddings (text, metadata, vector) VALUES (?, ?, ?)');
  stmt.run([text, JSON.stringify(metadata), JSON.stringify(vector)]);
  stmt.free();
  await persistDb(db);
}

export async function searchEmbedding(query: string, k: number) {
  const db = await getDb();
  db.run(`CREATE TABLE IF NOT EXISTS embeddings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT,
    metadata TEXT,
    vector TEXT
  );`);
  const qvec = embed(query);
  const stmt = db.prepare('SELECT text, metadata, vector FROM embeddings');
  const results: { text: string; metadata: any; score: number }[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as any;
    const vec = JSON.parse(row.vector);
    const score = cosine(qvec, vec);
    results.push({ text: row.text, metadata: JSON.parse(row.metadata), score });
  }
  stmt.free();
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, k);
}

