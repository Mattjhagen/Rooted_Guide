/**
 * BookmarkRepository Tests
 *
 * Tests for SQLite bookmark persistence:
 * - Add/remove bookmarks
 * - Check if verse is bookmarked
 * - Get all bookmarks
 * - Handle duplicates
 */

import Database from 'better-sqlite3';
import { SQLiteBookmarkRepository } from '@/infrastructure/persistence';
import {
  USER_DATA_SCHEMA_INIT_SQL,
  USER_DATA_SCHEMA_VERSION,
  insertSchemaVersion,
} from '@/infrastructure/persistence/userDataSchema';
import { VerseRef } from '@/domain/models';

describe('SQLiteBookmarkRepository', () => {
  let db: Database.Database;
  let repository: SQLiteBookmarkRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(USER_DATA_SCHEMA_INIT_SQL);
    db.exec(insertSchemaVersion(USER_DATA_SCHEMA_VERSION));

    repository = new SQLiteBookmarkRepository(db as any);
  });

  afterEach(() => {
    db.close();
  });

  describe('addBookmark', () => {
    it('should add a bookmark', async () => {
      const ref: VerseRef = { book: 'John', chapter: 3, verse: 16 };

      const bookmark = await repository.addBookmark(ref);

      expect(bookmark.id).toBeTruthy();
      expect(bookmark.verseRef).toEqual(ref);
      expect(bookmark.createdAt).toBeInstanceOf(Date);
    });

    it('should handle duplicate bookmarks', async () => {
      const ref: VerseRef = { book: 'John', chapter: 3, verse: 16 };

      await repository.addBookmark(ref);
      await repository.addBookmark(ref);

      const bookmarks = await repository.getAllBookmarks();
      expect(bookmarks).toHaveLength(1);
    });
  });

  describe('isBookmarked', () => {
    it('should return true for bookmarked verse', async () => {
      const ref: VerseRef = { book: 'John', chapter: 3, verse: 16 };
      await repository.addBookmark(ref);

      const isBookmarked = await repository.isBookmarked(ref);

      expect(isBookmarked).toBe(true);
    });

    it('should return false for non-bookmarked verse', async () => {
      const ref: VerseRef = { book: 'John', chapter: 3, verse: 16 };

      const isBookmarked = await repository.isBookmarked(ref);

      expect(isBookmarked).toBe(false);
    });
  });

  describe('getAllBookmarks', () => {
    it('should return all bookmarks sorted by most recent', async () => {
      const refs: VerseRef[] = [
        { book: 'John', chapter: 3, verse: 16 },
        { book: 'Genesis', chapter: 1, verse: 1 },
        { book: 'Psalms', chapter: 23, verse: 1 },
      ];

      for (const ref of refs) {
        await repository.addBookmark(ref);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const bookmarks = await repository.getAllBookmarks();

      expect(bookmarks).toHaveLength(3);
      expect(bookmarks[0].verseRef).toEqual(refs[2]);
      expect(bookmarks[2].verseRef).toEqual(refs[0]);
    });

    it('should return empty array when no bookmarks', async () => {
      const bookmarks = await repository.getAllBookmarks();

      expect(bookmarks).toEqual([]);
    });
  });

  describe('removeBookmark', () => {
    it('should remove bookmark by ID', async () => {
      const ref: VerseRef = { book: 'John', chapter: 3, verse: 16 };
      const bookmark = await repository.addBookmark(ref);

      await repository.removeBookmark(bookmark.id);

      const isBookmarked = await repository.isBookmarked(ref);
      expect(isBookmarked).toBe(false);
    });

    it('should remove bookmark by reference', async () => {
      const ref: VerseRef = { book: 'John', chapter: 3, verse: 16 };
      await repository.addBookmark(ref);

      await repository.removeBookmarkByRef(ref);

      const isBookmarked = await repository.isBookmarked(ref);
      expect(isBookmarked).toBe(false);
    });

    it('should handle removing non-existent bookmark', async () => {
      await expect(repository.removeBookmark('nonexistent')).resolves.not.toThrow();
    });
  });
});
