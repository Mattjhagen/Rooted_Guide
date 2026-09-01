import * as SQLite from 'expo-sqlite';
import { BookmarkRepository } from '@/domain/repositories';
import { Bookmark, VerseRef } from '@/domain/models';
import { createDBAdapter, DBAdapter } from './dbAdapter';

/**
 * SQLite implementation of BookmarkRepository
 *
 * Persists bookmarks to local SQLite database.
 * Uses canonical verse references (book name, chapter, verse).
 */
export class SQLiteBookmarkRepository implements BookmarkRepository {
  private dbAdapter: DBAdapter;

  constructor(db: SQLite.SQLiteDatabase | any) {
    this.dbAdapter = createDBAdapter(db);
  }

  /**
   * Get all bookmarks, sorted by most recent
   */
  async getAllBookmarks(): Promise<Bookmark[]> {
    try {
      const rows = this.dbAdapter.getAll<{
        id: string;
        book: string;
        chapter: number;
        verse: number;
        created_at: string;
      }>(
        `SELECT id, book, chapter, verse, created_at
         FROM bookmarks
         ORDER BY created_at DESC`
      );

      return rows.map((row) => ({
        id: row.id,
        verseRef: {
          book: row.book as any,
          chapter: row.chapter,
          verse: row.verse,
        },
        createdAt: new Date(row.created_at),
      }));
    } catch (error) {
      console.error('Error getting bookmarks:', error);
      return [];
    }
  }

  /**
   * Check if a verse is bookmarked
   */
  async isBookmarked(ref: VerseRef): Promise<boolean> {
    try {
      const result = this.dbAdapter.getFirst<{ count: number }>(
        `SELECT COUNT(*) as count
         FROM bookmarks
         WHERE book = ? AND chapter = ? AND verse = ?`,
        [ref.book, ref.chapter, ref.verse]
      );

      return (result?.count || 0) > 0;
    } catch (error) {
      console.error('Error checking bookmark:', error);
      return false;
    }
  }

  /**
   * Add a bookmark
   */
  async addBookmark(ref: VerseRef): Promise<Bookmark> {
    try {
      const id = `bookmark_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const createdAt = new Date().toISOString();

      this.dbAdapter.run(
        `INSERT OR REPLACE INTO bookmarks (id, book, chapter, verse, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, ref.book, ref.chapter, ref.verse, createdAt]
      );

      return {
        id,
        verseRef: ref,
        createdAt: new Date(createdAt),
      };
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw new Error('Failed to add bookmark');
    }
  }

  /**
   * Remove a bookmark
   */
  async removeBookmark(id: string): Promise<void> {
    try {
      this.dbAdapter.run(`DELETE FROM bookmarks WHERE id = ?`, [id]);
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw new Error('Failed to remove bookmark');
    }
  }

  /**
   * Remove bookmark by verse reference
   */
  async removeBookmarkByRef(ref: VerseRef): Promise<void> {
    try {
      this.dbAdapter.run(`DELETE FROM bookmarks WHERE book = ? AND chapter = ? AND verse = ?`, [
        ref.book,
        ref.chapter,
        ref.verse,
      ]);
    } catch (error) {
      console.error('Error removing bookmark by ref:', error);
      throw new Error('Failed to remove bookmark');
    }
  }
}
