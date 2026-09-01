/**
 * SQLite Schema for User Data Persistence
 *
 * Separate database from Bible content for privacy and data management.
 * Schema Version: 1
 *
 * Privacy:
 * - All data stays local by default
 * - No provider credentials, tokens, or raw safety metadata
 * - User can export and delete all data
 *
 * Design:
 * - Canonical local Bible passage/verse IDs (book, chapter, verse)
 * - created_at, updated_at timestamps
 * - Schema versioning for future migrations
 * - Soft deletion where sync will need it
 */

export const USER_DATA_SCHEMA_VERSION = 2;

/**
 * Initialize user data schema
 *
 * Creates tables for:
 * - Daily practice sessions and modules
 * - Reflections, prayers, and responses
 * - Contextual guide conversations (tied to passages)
 * - Bookmarks, highlights, notes
 * - User preferences
 * - Migration tracking
 *
 * Safe to call multiple times (idempotent).
 */
export const USER_DATA_SCHEMA_INIT_SQL = `
-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User preferences
CREATE TABLE IF NOT EXISTS preferences (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Daily practice sessions
CREATE TABLE IF NOT EXISTS daily_sessions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  next_devotional_available_at TEXT,
  last_module TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Daily practice modules (Arrive, Read, Reflect, Respond, Close)
CREATE TABLE IF NOT EXISTS daily_modules (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  module_type TEXT NOT NULL CHECK(module_type IN ('arrive', 'read', 'reflect', 'respond', 'close')),
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES daily_sessions(id) ON DELETE CASCADE
);

-- User reflections and responses
CREATE TABLE IF NOT EXISTS reflections (
  id TEXT PRIMARY KEY,
  module_id TEXT,
  kind TEXT NOT NULL CHECK(kind IN ('reflection', 'prayer', 'response', 'arrive', 'close')),
  content TEXT NOT NULL,
  book TEXT,
  chapter INTEGER,
  verse INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  FOREIGN KEY (module_id) REFERENCES daily_modules(id) ON DELETE SET NULL
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(book, chapter, verse)
);

-- Highlights
CREATE TABLE IF NOT EXISTS highlights (
  id TEXT PRIMARY KEY,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  color TEXT NOT NULL CHECK(color IN ('yellow', 'green', 'blue', 'pink', 'purple')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(book, chapter, verse)
);

-- Notes
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK(kind IN ('reflection', 'prayer')),
  content TEXT NOT NULL,
  book TEXT,
  chapter INTEGER,
  verse INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

-- Guide conversation threads
CREATE TABLE IF NOT EXISTS guide_threads (
  id TEXT PRIMARY KEY,
  book TEXT,
  chapter INTEGER,
  verse_start INTEGER,
  verse_end INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

-- Guide conversation turns
CREATE TABLE IF NOT EXISTS guide_turns (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'guide')),
  content TEXT NOT NULL,
  timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thread_id) REFERENCES guide_threads(id) ON DELETE CASCADE
);

-- Guide turn citations (verified Scripture references in responses)
CREATE TABLE IF NOT EXISTS guide_citations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  turn_id TEXT NOT NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT,
  FOREIGN KEY (turn_id) REFERENCES guide_turns(id) ON DELETE CASCADE
);

-- Guide turn suggestions (reflection prompts, questions, related verses)
CREATE TABLE IF NOT EXISTS guide_suggestions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  turn_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('reflection', 'question', 'related_verse')),
  text TEXT NOT NULL,
  book TEXT,
  chapter INTEGER,
  verse INTEGER,
  FOREIGN KEY (turn_id) REFERENCES guide_turns(id) ON DELETE CASCADE
);

-- Legacy data migration tracking
CREATE TABLE IF NOT EXISTS migration_status (
  key TEXT PRIMARY KEY,
  completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_daily_sessions_date ON daily_sessions(date);
CREATE INDEX IF NOT EXISTS idx_daily_modules_session ON daily_modules(session_id);
CREATE INDEX IF NOT EXISTS idx_reflections_module ON reflections(module_id);
CREATE INDEX IF NOT EXISTS idx_reflections_verse ON reflections(book, chapter, verse);
CREATE INDEX IF NOT EXISTS idx_reflections_created ON reflections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_verse ON bookmarks(book, chapter, verse);
CREATE INDEX IF NOT EXISTS idx_highlights_verse ON highlights(book, chapter, verse);
CREATE INDEX IF NOT EXISTS idx_notes_verse ON notes(book, chapter, verse);
CREATE INDEX IF NOT EXISTS idx_notes_created ON notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guide_threads_passage ON guide_threads(book, chapter, verse_start);
CREATE INDEX IF NOT EXISTS idx_guide_threads_updated ON guide_threads(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_guide_turns_thread ON guide_turns(thread_id);
CREATE INDEX IF NOT EXISTS idx_guide_citations_turn ON guide_citations(turn_id);
CREATE INDEX IF NOT EXISTS idx_guide_suggestions_turn ON guide_suggestions(turn_id);
`;

/**
 * Insert schema version marker
 */
export function insertSchemaVersion(version: number): string {
  return `INSERT OR REPLACE INTO schema_version (version) VALUES (${version});`;
}

/**
 * Check if migration has been completed
 */
export const CHECK_MIGRATION_SQL = `
SELECT completed_at FROM migration_status WHERE key = ?;
`;

/**
 * Mark migration as completed
 */
export function markMigrationComplete(key: string, notes?: string): string {
  const notesValue = notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL';
  return `INSERT OR REPLACE INTO migration_status (key, notes) VALUES ('${key}', ${notesValue});`;
}

/**
 * Clear all user data while preserving schema
 *
 * For "Delete all my data" functionality
 */
export const CLEAR_USER_DATA_SQL = `
DELETE FROM guide_suggestions;
DELETE FROM guide_citations;
DELETE FROM guide_turns;
DELETE FROM guide_threads;
DELETE FROM notes;
DELETE FROM highlights;
DELETE FROM bookmarks;
DELETE FROM reflections;
DELETE FROM daily_modules;
DELETE FROM daily_sessions;
DELETE FROM preferences;
DELETE FROM migration_status;
`;
