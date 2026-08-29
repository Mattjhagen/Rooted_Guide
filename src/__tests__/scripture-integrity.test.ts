/**
 * Scripture Corpus Integrity Tests
 *
 * Regression tests for Prompt 3B verse count reconciliation.
 * Verifies:
 * - Raw USFM source marker count
 * - Final normalized SQLite count
 * - The 5 empty verses are correctly excluded
 * - No valid verses are lost
 * - Structural integrity (66 books, 1,189 chapters, no Psalm 151)
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { parseUSFMFile } from '../infrastructure/scripture/usfmParser';

// Official corpus location
const USFM_DIR = '/tmp/rooted_bible_import/extracted';
const DB_PATH = path.join(__dirname, '../../assets/bible.db');

// Expected counts from official audit
const EXPECTED_RAW_MARKERS = 31103;
const EXPECTED_NORMALIZED_VERSES = 31098;
const EXPECTED_EMPTY_VERSES = 5;
const EXPECTED_BOOKS = 66;
const EXPECTED_CHAPTERS = 1189;

// The 5 textually uncertain verses (empty after footnote stripping)
const EXPECTED_EMPTY_VERSE_REFS = [
  { book: 'Luke', chapter: 17, verse: 36 },
  { book: 'Acts', chapter: 8, verse: 37 },
  { book: 'Acts', chapter: 15, verse: 34 },
  { book: 'Acts', chapter: 24, verse: 7 },
  { book: 'Romans', chapter: 16, verse: 25 },
];

describe('Scripture Corpus Integrity', () => {
  describe('Official USFM Source', () => {
    it('should have 66 canonical book files', () => {
      if (!fs.existsSync(USFM_DIR)) {
        console.warn('USFM source not found. Run import script to download.');
        return;
      }

      const files = fs
        .readdirSync(USFM_DIR)
        .filter((f) => f.endsWith('.usfm') && /^\d{2}-/.test(f));

      expect(files.length).toBeGreaterThanOrEqual(EXPECTED_BOOKS);
    });

    it('should contain exactly 31,103 raw verse markers in USFM source', () => {
      if (!fs.existsSync(USFM_DIR)) {
        console.warn('USFM source not found. Run import script to download.');
        return;
      }

      const files = fs
        .readdirSync(USFM_DIR)
        .filter((f) => f.endsWith('.usfm') && /^\d{2}-/.test(f));

      let totalMarkers = 0;

      for (const file of files) {
        const content = fs.readFileSync(path.join(USFM_DIR, file), 'utf-8');
        const lines = content.split('\n');

        for (const line of lines) {
          if (line.trim().startsWith('\\v ')) {
            totalMarkers++;
          }
        }
      }

      expect(totalMarkers).toBe(EXPECTED_RAW_MARKERS);
    });

    it('should identify exactly 5 empty verses after parser normalization', () => {
      if (!fs.existsSync(USFM_DIR)) {
        console.warn('USFM source not found. Run import script to download.');
        return;
      }

      const files = fs
        .readdirSync(USFM_DIR)
        .filter((f) => f.endsWith('.usfm') && /^\d{2}-/.test(f))
        .sort();

      let emptyVerseCount = 0;
      const emptyVerses: { file: string; chapter: number; verse: number }[] = [];

      for (const file of files) {
        const content = fs.readFileSync(path.join(USFM_DIR, file), 'utf-8');
        const parsed = parseUSFMFile(content, file);

        if (!parsed) continue;

        for (const chapter of parsed.chapters) {
          const verseNumbers = new Set(chapter.verses.map((v) => v.number));

          // Check for missing verse numbers (gaps indicate empty verses)
          const lines = content.split('\n');
          let currentChapter = 0;

          for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.startsWith('\\c ')) {
              const match = trimmed.match(/\\c\s+(\d+)/);
              if (match) {
                currentChapter = parseInt(match[1], 10);
              }
            }

            if (trimmed.startsWith('\\v ') && currentChapter === chapter.number) {
              const match = trimmed.match(/\\v\s+(\d+)\s+(.*)/);
              if (match) {
                const verseNum = parseInt(match[1], 10);
                const verseText = match[2];

                // Clean the text (same logic as parser)
                let cleaned = verseText;
                cleaned = cleaned.replace(/\\f\s+\+[^]*?\\f\*/g, '');
                cleaned = cleaned.replace(/\\x\s+[^]*?\\x\*/g, '');
                cleaned = cleaned.replace(/\\w\s+([^|\\]+)\|strong="[^"]+"\s*\\w\*/g, '$1');
                cleaned = cleaned.replace(/\\w\s+([^\\]+?)\\w\*/g, '$1');
                cleaned = cleaned.replace(/\\\+\w+\s+[^\\]+?\\\+\w+\*/g, '');
                cleaned = cleaned.replace(/\\\+\w+\s*/g, '');
                cleaned = cleaned.replace(/\\\+\w+\*/g, '');
                cleaned = cleaned.replace(/\\[a-z0-9]+\*?/gi, '');
                cleaned = cleaned.replace(/\s+/g, ' ').trim();

                if (cleaned.length === 0 && !verseNumbers.has(verseNum)) {
                  emptyVerseCount++;
                  emptyVerses.push({ file, chapter: currentChapter, verse: verseNum });
                }
              }
            }
          }
        }
      }

      expect(emptyVerseCount).toBe(EXPECTED_EMPTY_VERSES);
      expect(emptyVerses.length).toBe(EXPECTED_EMPTY_VERSES);
    });

    it('should confirm the 5 empty verses contain only footnotes', () => {
      if (!fs.existsSync(USFM_DIR)) {
        console.warn('USFM source not found. Run import script to download.');
        return;
      }

      const bookFileMap: Record<string, string> = {
        Luke: '72-LUKengwebp.usfm',
        Acts: '74-ACTengwebp.usfm',
        Romans: '75-ROMengwebp.usfm',
      };

      for (const expected of EXPECTED_EMPTY_VERSE_REFS) {
        const filename = bookFileMap[expected.book];
        const filePath = path.join(USFM_DIR, filename);

        if (!fs.existsSync(filePath)) continue;

        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        let currentChapter = 0;
        let foundVerse = false;

        for (const line of lines) {
          const trimmed = line.trim();

          if (trimmed.startsWith('\\c ')) {
            const match = trimmed.match(/\\c\s+(\d+)/);
            if (match) {
              currentChapter = parseInt(match[1], 10);
            }
          }

          if (trimmed.startsWith(`\\v ${expected.verse} `) && currentChapter === expected.chapter) {
            foundVerse = true;

            // Verify it's footnote-only
            expect(trimmed).toMatch(/\\f\s+\+/); // Contains footnote marker
            expect(trimmed).not.toMatch(/\\v\s+\d+\s+[^\\]/); // No text before markup
          }
        }

        if (fs.existsSync(filePath)) {
          expect(foundVerse).toBe(true);
        }
      }
    });
  });

  describe('Normalized SQLite Database', () => {
    it('should exist in the app assets directory', () => {
      expect(fs.existsSync(DB_PATH)).toBe(true);
    });

    it('should contain exactly 31,098 normalized verses', () => {
      if (!fs.existsSync(DB_PATH)) {
        throw new Error('Database not found. Run import script first.');
      }

      const result = execSync(`sqlite3 "${DB_PATH}" "SELECT COUNT(*) FROM verses;"`)
        .toString()
        .trim();

      expect(parseInt(result, 10)).toBe(EXPECTED_NORMALIZED_VERSES);
    });

    it('should contain exactly 66 books', () => {
      if (!fs.existsSync(DB_PATH)) {
        throw new Error('Database not found. Run import script first.');
      }

      const result = execSync(`sqlite3 "${DB_PATH}" "SELECT COUNT(*) FROM books;"`)
        .toString()
        .trim();

      expect(parseInt(result, 10)).toBe(EXPECTED_BOOKS);
    });

    it('should contain exactly 1,189 chapters', () => {
      if (!fs.existsSync(DB_PATH)) {
        throw new Error('Database not found. Run import script first.');
      }

      const result = execSync(
        `sqlite3 "${DB_PATH}" "SELECT COUNT(DISTINCT book_id || '-' || chapter) FROM verses;"`
      )
        .toString()
        .trim();

      expect(parseInt(result, 10)).toBe(EXPECTED_CHAPTERS);
    });

    it('should have Psalms with exactly 150 chapters (no Psalm 151)', () => {
      if (!fs.existsSync(DB_PATH)) {
        throw new Error('Database not found. Run import script first.');
      }

      // Psalms is book_id 19
      const result = execSync(
        `sqlite3 "${DB_PATH}" "SELECT MAX(chapter) FROM verses WHERE book_id = 19;"`
      )
        .toString()
        .trim();

      expect(parseInt(result, 10)).toBe(150);
    });

    it('should have no Psalm 151 verses', () => {
      if (!fs.existsSync(DB_PATH)) {
        throw new Error('Database not found. Run import script first.');
      }

      // Psalms is book_id 19
      const result = execSync(
        `sqlite3 "${DB_PATH}" "SELECT COUNT(*) FROM verses WHERE book_id = 19 AND chapter = 151;"`
      )
        .toString()
        .trim();

      expect(parseInt(result, 10)).toBe(0);
    });

    it('should have no HTML markup in verse text', () => {
      if (!fs.existsSync(DB_PATH)) {
        throw new Error('Database not found. Run import script first.');
      }

      const result = execSync(
        `sqlite3 "${DB_PATH}" "SELECT COUNT(*) FROM verses WHERE text LIKE '%<b>%' OR text LIKE '%<i>%' OR text LIKE '%<span>%';"`
      )
        .toString()
        .trim();

      expect(parseInt(result, 10)).toBe(0);
    });

    it('should not contain the 5 empty verse references', () => {
      if (!fs.existsSync(DB_PATH)) {
        throw new Error('Database not found. Run import script first.');
      }

      // Book ID mapping for expected empty verses
      const bookIdMap: Record<string, number> = {
        Luke: 42,
        Acts: 44,
        Romans: 45,
      };

      for (const expected of EXPECTED_EMPTY_VERSE_REFS) {
        const bookId = bookIdMap[expected.book];
        const result = execSync(
          `sqlite3 "${DB_PATH}" "SELECT COUNT(*) FROM verses WHERE book_id = ${bookId} AND chapter = ${expected.chapter} AND verse = ${expected.verse};"`
        )
          .toString()
          .trim();

        expect(parseInt(result, 10)).toBe(0);
      }
    });
  });

  describe('Reconciliation Verification', () => {
    it('should reconcile: raw markers - empty = normalized verses', () => {
      if (!fs.existsSync(USFM_DIR) || !fs.existsSync(DB_PATH)) {
        console.warn('Source or database not found. Run import script to verify.');
        return;
      }

      // This test verifies the equation: 31,103 - 5 = 31,098
      const reconciled = EXPECTED_RAW_MARKERS - EXPECTED_EMPTY_VERSES;
      expect(reconciled).toBe(EXPECTED_NORMALIZED_VERSES);

      // Verify database matches reconciled count
      const result = execSync(`sqlite3 "${DB_PATH}" "SELECT COUNT(*) FROM verses;"`)
        .toString()
        .trim();

      expect(parseInt(result, 10)).toBe(reconciled);
    });
  });
});
