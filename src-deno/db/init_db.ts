// src-deno/db/init_db.ts
import { DB } from "https://deno.land/x/sqlite@v3.8/mod.ts";

// Initialize the database with a simple approach
const db = new DB("./app.db", { mode: "create" });

// Create tables if they don't exist
db.execute(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )
`);

db.execute(`
  CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    size INTEGER NOT NULL,
    mime_type TEXT,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

db.execute(`
  CREATE TABLE IF NOT EXISTS knowledge_bases (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    embedding_model TEXT NOT NULL,
    vector_size INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

db.execute(`
  CREATE TABLE IF NOT EXISTS knowledge_base_files (
    knowledge_base_id TEXT,
    file_id TEXT,
    PRIMARY KEY (knowledge_base_id, file_id),
    FOREIGN KEY (knowledge_base_id) REFERENCES knowledge_bases(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
  )
`);

db.execute(`
  CREATE TABLE IF NOT EXISTS assistants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    model TEXT NOT NULL,
    system_prompt TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

db.execute(`
  CREATE TABLE IF NOT EXISTS assistant_knowledge_bases (
    assistant_id TEXT,
    knowledge_base_id TEXT,
    PRIMARY KEY (assistant_id, knowledge_base_id),
    FOREIGN KEY (assistant_id) REFERENCES assistants(id) ON DELETE CASCADE,
    FOREIGN KEY (knowledge_base_id) REFERENCES knowledge_bases(id) ON DELETE CASCADE
  )
`);

db.execute(`
  CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    assistant_id TEXT,
    title TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assistant_id) REFERENCES assistants(id) ON DELETE SET NULL
  )
`);

db.execute(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
  )
`);

console.log("Database initialized successfully");

// Insert some default settings
db.execute(
  "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
  ["theme", "dark"]
);
db.execute(
  "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
  ["language", "en"]
);
db.execute(
  "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
  ["defaultModel", "gpt-4"]
);
db.execute(
  "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
  ["qdrantUrl", "http://localhost:6333"]
);

// Close the database connection
db.close();