/**
 * HighlightRepository Tests
 *
 * Tests for SQLite highlight persistence:
 * - Set/get/remove highlights
 * - Change highlight color
 * - Handle duplicates
 */

import Database from 'better-sqlite3';
import { SQLiteHighlightRepository } from '@/infrastructure/persistence';
import {
  USER_DATA_SCHEMA_INIT_SQL,
  USER_DATA_SCHEMA_VERSION,
  insertSchemaVersion,
} from '@/infrastructure/persistence/userDataSchema';
import { VerseRef, HighlightColor } from '@/domain/models';

describe('SQLiteHighlightRepository', () => {
  let db: Database.Database;
  let repository: SQLiteHighlightRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(USER_DATA_SCHEMA_INIT_SQL);
    db.exec(insertSchemaVersion(USER_DATA_SCHEMA_VERSION));

    repository = new SQLiteHighlightRepository(db as any);
  });

  afterEach(() => {
    db.close();
  });

  describe('setHighlight', () => {
    it('should add a highlight', async () => {
      const ref: VerseRef = { book: 'John', chapter: 3, verse: 16 };
      const color: HighlightColor = 'yellow';

      const highlight = await repository.setHighlight(ref, color);

      expect(highlight.id).toBeTruthy();
      expect(highlight.verseRef).toEqual(ref);
      expect(highlight.color).toBe(color);
      expect(highlight.createdAt).toBeInstanceOf(Date);
    });

    it('should replace existing highlight with new color', async () => {
      const ref: VerseRef = { book: 'John', chapter: 3, verse: 16 };

      await repository.setHighlight(ref, 'yellow');
      await repository.setHighlight(ref, 'blue');

      const highlight = await repository.getHighlight(ref);

      expect(highlight).not.toBeNull();
      expect(highlight?.color).toBe('blue');
    });
  });

  describe('getHighlight', () => {
    it('should return highlight for verse', async () => {
      const ref: VerseRef = { book: 'John', chapter: 3, verse: 16 };
      await repository.setHighlight(ref, 'yellow');

      const highlight = await repository.getHighlight(ref);

      expect(highlight).not.toBeNull();
      expect(highlight?.verseRef).toEqual(ref);
      expect(highlight?.color).toBe('yellow');
    });

    it('should return null for non-highlighted verse', async () => {
      const ref: VerseRef = { book: 'John', chapter: 3, verse: 16 };

      const highlight = await repository.getHighlight(ref);

      expect(highlight).toBeNull();
    });
  });

  describe('getAllHighlights', () => {
    it('should return all highlights', async () => {
      const refs: VerseRef[] = [
        { book: 'John', chapter: 3, verse: 16 },
        { book: 'Genesis', chapter: 1, verse: 1 },
      ];

      await repository.setHighlight(refs[0], 'yellow');
      await repository.setHighlight(refs[1], 'blue');

      const highlights = await repository.getAllHighlights();

      expect(highlights).toHaveLength(2);
    });

    it('should return empty array when no highlights', async () => {
      const highlights = await repository.getAllHighlights();

      expect(highlights).toEqual([]);
    });
  });

  describe('removeHighlight', () => {
    it('should remove highlight by ID', async () => {
      const ref: VerseRef = { book: 'John', chapter: 3, verse: 16 };
      const highlight = await repository.setHighlight(ref, 'yellow');

      await repository.removeHighlight(highlight.id);

      const result = await repository.getHighlight(ref);
      expect(result).toBeNull();
    });

    it('should remove highlight by reference', async () => {
      const ref: VerseRef = { book: 'John', chapter: 3, verse: 16 };
      await repository.setHighlight(ref, 'yellow');

      await repository.removeHighlightByRef(ref);

      const result = await repository.getHighlight(ref);
      expect(result).toBeNull();
    });
  });

  describe('color validation', () => {
    it('should accept valid colors', async () => {
      const ref: VerseRef = { book: 'John', chapter: 3, verse: 16 };
      const colors: HighlightColor[] = ['yellow', 'green', 'blue', 'pink', 'purple'];

      for (const color of colors) {
        await repository.setHighlight(ref, color);
        const highlight = await repository.getHighlight(ref);
        expect(highlight?.color).toBe(color);
      }
    });
  });
});
