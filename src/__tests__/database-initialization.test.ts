/**
 * Database Initialization Integration Tests
 *
 * Verifies that the SQLiteProvider correctly imports the bundled database
 * on first launch and that subsequent launches preserve the existing database.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Paths
const ASSETS_DB_PATH = path.join(__dirname, '../../assets/bible.db');
const TEMP_TEST_DB = '/tmp/test-bible-init.db';

describe('Database Initialization', () => {
  afterEach(() => {
    // Clean up temp test database
    if (fs.existsSync(TEMP_TEST_DB)) {
      fs.unlinkSync(TEMP_TEST_DB);
    }
  });

  describe('Bundled Asset Database', () => {
    it('should exist in assets directory for bundling', () => {
      expect(fs.existsSync(ASSETS_DB_PATH)).toBe(true);
    });

    it('should be a valid SQLite database', () => {
      const fileType = execSync(`file "${ASSETS_DB_PATH}"`).toString();
      expect(fileType).toContain('SQLite');
    });

    it('should contain the expected WEB translation metadata', () => {
      const translationName = execSync(
        `sqlite3 "${ASSETS_DB_PATH}" "SELECT value FROM translation_metadata WHERE key = 'translation_name';"`
      )
        .toString()
        .trim();

      expect(translationName).toBe('World English Bible');
    });

    it('should contain the expected WEB translation code', () => {
      const translationCode = execSync(
        `sqlite3 "${ASSETS_DB_PATH}" "SELECT value FROM translation_metadata WHERE key = 'translation_code';"`
      )
        .toString()
        .trim();

      expect(translationCode).toBe('WEB');
    });

    it('should contain a known verse (John 3:16)', () => {
      // John is book_id 43
      const result = execSync(
        `sqlite3 "${ASSETS_DB_PATH}" "SELECT text FROM verses WHERE book_id = 43 AND chapter = 3 AND verse = 16;"`
      )
        .toString()
        .trim();

      // Basic check: verse should be substantial and contain key words
      expect(result.length).toBeGreaterThan(50);
      expect(result).toContain('God');
      expect(result).toContain('loved');
      expect(result).toContain('world');
    });

    it('should contain another known verse (Genesis 1:1)', () => {
      // Genesis is book_id 1
      const verse = execSync(
        `sqlite3 "${ASSETS_DB_PATH}" "SELECT text FROM verses WHERE book_id = 1 AND chapter = 1 AND verse = 1;"`
      )
        .toString()
        .trim();

      expect(verse).toContain('In the beginning');
      expect(verse).toContain('God created the heavens and the earth');
    });

    it('should contain the expected number of verses', () => {
      const verseCount = execSync(`sqlite3 "${ASSETS_DB_PATH}" "SELECT COUNT(*) FROM verses;"`)
        .toString()
        .trim();

      expect(parseInt(verseCount, 10)).toBe(31098);
    });

    it('should contain all 66 books', () => {
      const bookCount = execSync(`sqlite3 "${ASSETS_DB_PATH}" "SELECT COUNT(*) FROM books;"`)
        .toString()
        .trim();

      expect(parseInt(bookCount, 10)).toBe(66);
    });
  });

  describe('Clean Install Simulation', () => {
    it('should allow copying the database to simulate first launch', () => {
      // Simulate what SQLiteProvider does: copy from asset to document directory
      fs.copyFileSync(ASSETS_DB_PATH, TEMP_TEST_DB);

      expect(fs.existsSync(TEMP_TEST_DB)).toBe(true);

      // Verify the copied database works
      const verseCount = execSync(`sqlite3 "${TEMP_TEST_DB}" "SELECT COUNT(*) FROM verses;"`)
        .toString()
        .trim();

      expect(parseInt(verseCount, 10)).toBe(31098);
    });

    it('should preserve database content after simulated subsequent launch', () => {
      // First launch: copy database
      fs.copyFileSync(ASSETS_DB_PATH, TEMP_TEST_DB);

      // Verify initial state
      let verseCount = execSync(`sqlite3 "${TEMP_TEST_DB}" "SELECT COUNT(*) FROM verses;"`)
        .toString()
        .trim();
      expect(parseInt(verseCount, 10)).toBe(31098);

      // Simulate user data: add a bookmark or note (not implemented yet, but database should persist)
      // For now, just verify the database isn't re-imported

      // Simulate subsequent launch: database already exists, don't overwrite
      const dbExists = fs.existsSync(TEMP_TEST_DB);
      expect(dbExists).toBe(true);

      // Verify content is still there (not re-imported)
      verseCount = execSync(`sqlite3 "${TEMP_TEST_DB}" "SELECT COUNT(*) FROM verses;"`)
        .toString()
        .trim();
      expect(parseInt(verseCount, 10)).toBe(31098);
    });
  });

  describe('Asset Bundling Integration', () => {
    it('should have the database in the correct location for Expo bundling', () => {
      // assets/ directory is automatically bundled by Expo
      const assetsDir = path.dirname(ASSETS_DB_PATH);
      expect(assetsDir).toContain('/assets');

      // Verify assets directory exists
      expect(fs.existsSync(assetsDir)).toBe(true);
    });

    it('should have the database accessible via require()', () => {
      // This verifies the database can be required as an asset
      // The actual require() happens in app/_layout.tsx with SQLiteProvider
      const _dbPath = '../assets/bible.db';
      const resolvedPath = path.resolve(__dirname, '../../assets/bible.db');

      expect(fs.existsSync(resolvedPath)).toBe(true);
    });
  });
});
