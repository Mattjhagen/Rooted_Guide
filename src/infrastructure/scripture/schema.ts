/**
 * SQLite Schema for Bible Repository
 *
 * Version: 1
 * Translation: World English Bible (engwebp)
 * Canon: 66-book Protestant
 */

/**
 * Schema version for migration tracking
 */
export const SCHEMA_VERSION = 1;

/**
 * Initialize database schema
 *
 * Creates tables, indexes, and metadata if they don't exist.
 * Safe to call multiple times (idempotent).
 */
export const SCHEMA_INIT_SQL = `
-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Translation metadata
CREATE TABLE IF NOT EXISTS translation_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY,
  usfm_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  canonical_order INTEGER NOT NULL UNIQUE,
  testament TEXT NOT NULL CHECK(testament IN ('OT', 'NT'))
);

-- Verses table
CREATE TABLE IF NOT EXISTS verses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id),
  UNIQUE(book_id, chapter, verse)
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_verses_book_chapter ON verses(book_id, chapter);
CREATE INDEX IF NOT EXISTS idx_verses_book_chapter_verse ON verses(book_id, chapter, verse);
CREATE INDEX IF NOT EXISTS idx_books_canonical_order ON books(canonical_order);
`;

/**
 * FTS5 virtual table creation (if FTS5 is available)
 *
 * This provides full-text search capabilities.
 * Falls back to LIKE search if FTS5 is not available.
 */
export const FTS5_TABLE_SQL = `
-- Full-text search index
CREATE VIRTUAL TABLE IF NOT EXISTS verses_fts USING fts5(
  book_id UNINDEXED,
  chapter UNINDEXED,
  verse UNINDEXED,
  text,
  content=verses,
  content_rowid=id
);

-- Triggers to keep FTS index synchronized
CREATE TRIGGER IF NOT EXISTS verses_fts_insert AFTER INSERT ON verses BEGIN
  INSERT INTO verses_fts(rowid, book_id, chapter, verse, text)
  VALUES (new.id, new.book_id, new.chapter, new.verse, new.text);
END;

CREATE TRIGGER IF NOT EXISTS verses_fts_delete AFTER DELETE ON verses BEGIN
  DELETE FROM verses_fts WHERE rowid = old.id;
END;

CREATE TRIGGER IF NOT EXISTS verses_fts_update AFTER UPDATE ON verses BEGIN
  DELETE FROM verses_fts WHERE rowid = old.id;
  INSERT INTO verses_fts(rowid, book_id, chapter, verse, text)
  VALUES (new.id, new.book_id, new.chapter, new.verse, new.text);
END;
`;

/**
 * Clear all data from the database while preserving schema
 *
 * Useful for re-importing corpus with different version.
 */
export const CLEAR_DATA_SQL = `
DELETE FROM verses;
DELETE FROM books;
DELETE FROM translation_metadata;
`;

/**
 * Insert translation metadata
 *
 * Stores provenance information about the imported corpus.
 */
export function buildMetadataInsert(metadata: Record<string, string>): string[] {
  const inserts: string[] = [];
  for (const [key, value] of Object.entries(metadata)) {
    inserts.push(
      `INSERT OR REPLACE INTO translation_metadata (key, value) VALUES ('${escapeSQL(key)}', '${escapeSQL(value)}');`
    );
  }
  return inserts;
}

/**
 * Escape SQL string values
 */
function escapeSQL(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * Canonical book data for 66-book Protestant canon
 */
export const CANONICAL_BOOKS = [
  // Old Testament
  { usfmId: 'GEN', name: 'Genesis', order: 1, testament: 'OT' },
  { usfmId: 'EXO', name: 'Exodus', order: 2, testament: 'OT' },
  { usfmId: 'LEV', name: 'Leviticus', order: 3, testament: 'OT' },
  { usfmId: 'NUM', name: 'Numbers', order: 4, testament: 'OT' },
  { usfmId: 'DEU', name: 'Deuteronomy', order: 5, testament: 'OT' },
  { usfmId: 'JOS', name: 'Joshua', order: 6, testament: 'OT' },
  { usfmId: 'JDG', name: 'Judges', order: 7, testament: 'OT' },
  { usfmId: 'RUT', name: 'Ruth', order: 8, testament: 'OT' },
  { usfmId: '1SA', name: '1 Samuel', order: 9, testament: 'OT' },
  { usfmId: '2SA', name: '2 Samuel', order: 10, testament: 'OT' },
  { usfmId: '1KI', name: '1 Kings', order: 11, testament: 'OT' },
  { usfmId: '2KI', name: '2 Kings', order: 12, testament: 'OT' },
  { usfmId: '1CH', name: '1 Chronicles', order: 13, testament: 'OT' },
  { usfmId: '2CH', name: '2 Chronicles', order: 14, testament: 'OT' },
  { usfmId: 'EZR', name: 'Ezra', order: 15, testament: 'OT' },
  { usfmId: 'NEH', name: 'Nehemiah', order: 16, testament: 'OT' },
  { usfmId: 'EST', name: 'Esther', order: 17, testament: 'OT' },
  { usfmId: 'JOB', name: 'Job', order: 18, testament: 'OT' },
  { usfmId: 'PSA', name: 'Psalms', order: 19, testament: 'OT' },
  { usfmId: 'PRO', name: 'Proverbs', order: 20, testament: 'OT' },
  { usfmId: 'ECC', name: 'Ecclesiastes', order: 21, testament: 'OT' },
  { usfmId: 'SNG', name: 'Song of Solomon', order: 22, testament: 'OT' },
  { usfmId: 'ISA', name: 'Isaiah', order: 23, testament: 'OT' },
  { usfmId: 'JER', name: 'Jeremiah', order: 24, testament: 'OT' },
  { usfmId: 'LAM', name: 'Lamentations', order: 25, testament: 'OT' },
  { usfmId: 'EZK', name: 'Ezekiel', order: 26, testament: 'OT' },
  { usfmId: 'DAN', name: 'Daniel', order: 27, testament: 'OT' },
  { usfmId: 'HOS', name: 'Hosea', order: 28, testament: 'OT' },
  { usfmId: 'JOL', name: 'Joel', order: 29, testament: 'OT' },
  { usfmId: 'AMO', name: 'Amos', order: 30, testament: 'OT' },
  { usfmId: 'OBA', name: 'Obadiah', order: 31, testament: 'OT' },
  { usfmId: 'JON', name: 'Jonah', order: 32, testament: 'OT' },
  { usfmId: 'MIC', name: 'Micah', order: 33, testament: 'OT' },
  { usfmId: 'NAM', name: 'Nahum', order: 34, testament: 'OT' },
  { usfmId: 'HAB', name: 'Habakkuk', order: 35, testament: 'OT' },
  { usfmId: 'ZEP', name: 'Zephaniah', order: 36, testament: 'OT' },
  { usfmId: 'HAG', name: 'Haggai', order: 37, testament: 'OT' },
  { usfmId: 'ZEC', name: 'Zechariah', order: 38, testament: 'OT' },
  { usfmId: 'MAL', name: 'Malachi', order: 39, testament: 'OT' },
  // New Testament
  { usfmId: 'MAT', name: 'Matthew', order: 40, testament: 'NT' },
  { usfmId: 'MRK', name: 'Mark', order: 41, testament: 'NT' },
  { usfmId: 'LUK', name: 'Luke', order: 42, testament: 'NT' },
  { usfmId: 'JHN', name: 'John', order: 43, testament: 'NT' },
  { usfmId: 'ACT', name: 'Acts', order: 44, testament: 'NT' },
  { usfmId: 'ROM', name: 'Romans', order: 45, testament: 'NT' },
  { usfmId: '1CO', name: '1 Corinthians', order: 46, testament: 'NT' },
  { usfmId: '2CO', name: '2 Corinthians', order: 47, testament: 'NT' },
  { usfmId: 'GAL', name: 'Galatians', order: 48, testament: 'NT' },
  { usfmId: 'EPH', name: 'Ephesians', order: 49, testament: 'NT' },
  { usfmId: 'PHP', name: 'Philippians', order: 50, testament: 'NT' },
  { usfmId: 'COL', name: 'Colossians', order: 51, testament: 'NT' },
  { usfmId: '1TH', name: '1 Thessalonians', order: 52, testament: 'NT' },
  { usfmId: '2TH', name: '2 Thessalonians', order: 53, testament: 'NT' },
  { usfmId: '1TI', name: '1 Timothy', order: 54, testament: 'NT' },
  { usfmId: '2TI', name: '2 Timothy', order: 55, testament: 'NT' },
  { usfmId: 'TIT', name: 'Titus', order: 56, testament: 'NT' },
  { usfmId: 'PHM', name: 'Philemon', order: 57, testament: 'NT' },
  { usfmId: 'HEB', name: 'Hebrews', order: 58, testament: 'NT' },
  { usfmId: 'JAS', name: 'James', order: 59, testament: 'NT' },
  { usfmId: '1PE', name: '1 Peter', order: 60, testament: 'NT' },
  { usfmId: '2PE', name: '2 Peter', order: 61, testament: 'NT' },
  { usfmId: '1JN', name: '1 John', order: 62, testament: 'NT' },
  { usfmId: '2JN', name: '2 John', order: 63, testament: 'NT' },
  { usfmId: '3JN', name: '3 John', order: 64, testament: 'NT' },
  { usfmId: 'JUD', name: 'Jude', order: 65, testament: 'NT' },
  { usfmId: 'REV', name: 'Revelation', order: 66, testament: 'NT' },
];

/**
 * Get book ID from USFM ID
 */
export function getBookId(usfmId: string): number | null {
  const book = CANONICAL_BOOKS.find((b) => b.usfmId === usfmId);
  return book ? book.order : null;
}

/**
 * Get book name from USFM ID
 */
export function getBookName(usfmId: string): string | null {
  const book = CANONICAL_BOOKS.find((b) => b.usfmId === usfmId);
  return book ? book.name : null;
}
