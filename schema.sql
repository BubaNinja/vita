-- schema.sql — создать таблицу заявок
-- Выполнить: wrangler d1 execute DB --file=schema.sql

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  doctor TEXT DEFAULT '',
  date TEXT DEFAULT '',
  time TEXT DEFAULT '',
  service TEXT DEFAULT '',
  preorder TEXT DEFAULT '',
  comment TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  status TEXT DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS idx_site ON submissions(site);
CREATE INDEX IF NOT EXISTS idx_created ON submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_status ON submissions(status);
