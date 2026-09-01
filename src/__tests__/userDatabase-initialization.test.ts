/**
 * User Database Initialization Tests
 *
 * Tests for database schema creation and migrations:
 * - Fresh install
 * - Schema version tracking
 * - Idempotent initialization
 * - Database verification
 */

import Database from 'better-sqlite3';
import { initUserDatabase, verifyUserDatabase } from '@/infrastructure/persistence';
import { USER_DATA_SCHEMA_VERSION } from '@/infrastructure/persistence/userDataSchema';

describe('User Database Initialization', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  describe('initUserDatabase', () => {
    it('should initialize schema on fresh database', () => {
      expect(() => initUserDatabase(db as any)).not.toThrow();

      const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all() as {
        name: string;
      }[];

      const tableNames = tables.map((t) => t.name);
      expect(tableNames).toContain('schema_version');
      expect(tableNames).toContain('preferences');
      expect(tableNames).toContain('bookmarks');
      expect(tableNames).toContain('highlights');
      expect(tableNames).toContain('notes');
      expect(tableNames).toContain('guide_threads');
      expect(tableNames).toContain('daily_sessions');
    });

    it('should record schema version', () => {
      initUserDatabase(db as any);

      const version = db
        .prepare('SELECT version FROM schema_version ORDER BY version DESC LIMIT 1')
        .get() as { version: number };

      expect(version.version).toBe(USER_DATA_SCHEMA_VERSION);
    });

    it('should be idempotent', () => {
      initUserDatabase(db as any);
      initUserDatabase(db as any);
      initUserDatabase(db as any);

      const versions = db.prepare('SELECT COUNT(*) as count FROM schema_version').get() as {
        count: number;
      };

      expect(versions.count).toBeGreaterThanOrEqual(1);
    });

    it('should create indexes', () => {
      initUserDatabase(db as any);

      const indexes = db.prepare(`SELECT name FROM sqlite_master WHERE type='index'`).all() as {
        name: string;
      }[];

      const indexNames = indexes.map((i) => i.name);
      expect(indexNames).toContain('idx_bookmarks_verse');
      expect(indexNames).toContain('idx_highlights_verse');
      expect(indexNames).toContain('idx_notes_created');
      expect(indexNames).toContain('idx_guide_threads_updated');
    });
  });

  describe('verifyUserDatabase', () => {
    it('should verify initialized database', () => {
      initUserDatabase(db as any);

      const isValid = verifyUserDatabase(db as any);

      expect(isValid).toBe(true);
    });

    it('should fail for uninitialized database', () => {
      const isValid = verifyUserDatabase(db as any);

      expect(isValid).toBe(false);
    });

    it('should verify all required tables', () => {
      initUserDatabase(db as any);

      const requiredTables = [
        'schema_version',
        'preferences',
        'daily_sessions',
        'daily_modules',
        'reflections',
        'bookmarks',
        'highlights',
        'notes',
        'guide_threads',
        'guide_turns',
        'guide_citations',
        'guide_suggestions',
        'migration_status',
      ];

      for (const table of requiredTables) {
        const result = db
          .prepare(`SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name=?`)
          .get(table) as { count: number };

        expect(result.count).toBe(1);
      }
    });
  });

  describe('schema constraints', () => {
    beforeEach(() => {
      initUserDatabase(db as any);
    });

    it('should enforce unique bookmarks per verse', () => {
      db.prepare('INSERT INTO bookmarks (id, book, chapter, verse) VALUES (?, ?, ?, ?)').run(
        'id1',
        'John',
        3,
        16
      );

      expect(() => {
        db.prepare('INSERT INTO bookmarks (id, book, chapter, verse) VALUES (?, ?, ?, ?)').run(
          'id2',
          'John',
          3,
          16
        );
      }).toThrow();
    });

    it('should enforce unique highlights per verse', () => {
      db.prepare(
        'INSERT INTO highlights (id, book, chapter, verse, color) VALUES (?, ?, ?, ?, ?)'
      ).run('id1', 'John', 3, 16, 'yellow');

      expect(() => {
        db.prepare(
          'INSERT INTO highlights (id, book, chapter, verse, color) VALUES (?, ?, ?, ?, ?)'
        ).run('id2', 'John', 3, 16, 'blue');
      }).toThrow();
    });

    it('should enforce valid note kinds', () => {
      expect(() => {
        db.prepare('INSERT INTO notes (id, kind, content) VALUES (?, ?, ?)').run(
          'id1',
          'invalid',
          'content'
        );
      }).toThrow();
    });

    it('should enforce valid highlight colors', () => {
      expect(() => {
        db.prepare(
          'INSERT INTO highlights (id, book, chapter, verse, color) VALUES (?, ?, ?, ?, ?)'
        ).run('id1', 'John', 3, 16, 'invalid');
      }).toThrow();
    });

    it('should enforce valid module types', () => {
      db.prepare('INSERT INTO daily_sessions (id, date) VALUES (?, ?)').run(
        'session1',
        '2026-08-31'
      );

      expect(() => {
        db.prepare('INSERT INTO daily_modules (id, session_id, module_type) VALUES (?, ?, ?)').run(
          'module1',
          'session1',
          'invalid'
        );
      }).toThrow();
    });
  });

  describe('cascading deletes', () => {
    beforeEach(() => {
      initUserDatabase(db as any);
    });

    it('should cascade delete modules when session is deleted', () => {
      db.prepare('INSERT INTO daily_sessions (id, date) VALUES (?, ?)').run(
        'session1',
        '2026-08-31'
      );
      db.prepare('INSERT INTO daily_modules (id, session_id, module_type) VALUES (?, ?, ?)').run(
        'module1',
        'session1',
        'arrive'
      );

      db.prepare('DELETE FROM daily_sessions WHERE id = ?').run('session1');

      const modules = db.prepare('SELECT COUNT(*) as count FROM daily_modules').get() as {
        count: number;
      };
      expect(modules.count).toBe(0);
    });

    it('should cascade delete turns when thread is deleted', () => {
      db.prepare('INSERT INTO guide_threads (id) VALUES (?)').run('thread1');
      db.prepare('INSERT INTO guide_turns (id, thread_id, role, content) VALUES (?, ?, ?, ?)').run(
        'turn1',
        'thread1',
        'user',
        'Hello'
      );

      db.prepare('DELETE FROM guide_threads WHERE id = ?').run('thread1');

      const turns = db.prepare('SELECT COUNT(*) as count FROM guide_turns').get() as {
        count: number;
      };
      expect(turns.count).toBe(0);
    });
  });
});
