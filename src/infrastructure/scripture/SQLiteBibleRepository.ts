import * as SQLite from 'expo-sqlite';
import { BibleRepository } from '@/domain/repositories';
import { Verse, VerseRef, ChapterRef, PassageRef, BibleBookValue } from '@/domain/models';
import { CANONICAL_BOOKS } from './schema';
import { createDBAdapter, DBAdapter } from '@/infrastructure/persistence/dbAdapter';

/**
 * SQLite implementation of BibleRepository
 *
 * Provides offline Scripture access using local SQLite database.
 * Supports FTS5 full-text search if available, with indexed fallback.
 *
 * NOTE: The database is pre-populated and bundled with the app using SQLiteProvider.
 * No schema initialization is needed - the database is imported from assets/bible.db on first launch.
 */
export class SQLiteBibleRepository implements BibleRepository {
  private dbAdapter: DBAdapter;
  private ftsAvailable: boolean = false;

  constructor(db: SQLite.SQLiteDatabase | any) {
    this.dbAdapter = createDBAdapter(db);
    this.detectFTS5Support();
  }

  /**
   * Detect if FTS5 is available in this SQLite build
   */
  private detectFTS5Support(): void {
    try {
      // Try to create a test FTS5 table
      this.dbAdapter.exec(`
        CREATE VIRTUAL TABLE IF NOT EXISTS _fts_test USING fts5(content);
        DROP TABLE IF EXISTS _fts_test;
      `);
      this.ftsAvailable = true;
    } catch {
      console.log('FTS5 not available, using indexed search fallback');
      this.ftsAvailable = false;
    }
  }

  /**
   * Check if FTS5 is enabled
   */
  public hasFTS5(): boolean {
    return this.ftsAvailable;
  }

  /**
   * Get a single verse by reference
   */
  async getVerse(ref: VerseRef): Promise<Verse | null> {
    try {
      const bookId = this.getBookIdFromValue(ref.book);
      if (!bookId) return null;

      const result = this.dbAdapter.getFirst<{ text: string; translation: string }>(
        `SELECT text, 'WEB' as translation
         FROM verses
         WHERE book_id = ? AND chapter = ? AND verse = ?`,
        [bookId, ref.chapter, ref.verse]
      );

      if (!result) return null;

      return {
        ref,
        text: result.text,
        translation: result.translation,
      };
    } catch (error) {
      console.error('Error getting verse:', error);
      return null;
    }
  }

  /**
   * Get all verses in a chapter
   */
  async getChapter(ref: ChapterRef): Promise<Verse[]> {
    try {
      const bookId = this.getBookIdFromValue(ref.book);
      if (!bookId) return [];

      const rows = this.dbAdapter.getAll<{ verse: number; text: string }>(
        `SELECT verse, text
         FROM verses
         WHERE book_id = ? AND chapter = ?
         ORDER BY verse ASC`,
        [bookId, ref.chapter]
      );

      return rows.map((row) => ({
        ref: { book: ref.book, chapter: ref.chapter, verse: row.verse },
        text: row.text,
        translation: 'WEB',
      }));
    } catch (error) {
      console.error('Error getting chapter:', error);
      return [];
    }
  }

  /**
   * Get a range of verses (passage)
   */
  async getPassage(ref: PassageRef): Promise<Verse[]> {
    try {
      const bookId = this.getBookIdFromValue(ref.book);
      if (!bookId) return [];

      const rows = this.dbAdapter.getAll<{ verse: number; text: string }>(
        `SELECT verse, text
         FROM verses
         WHERE book_id = ? AND chapter = ? AND verse >= ? AND verse <= ?
         ORDER BY verse ASC`,
        [bookId, ref.chapter, ref.verseStart, ref.verseEnd]
      );

      return rows.map((row) => ({
        ref: { book: ref.book, chapter: ref.chapter, verse: row.verse },
        text: row.text,
        translation: 'WEB',
      }));
    } catch (error) {
      console.error('Error getting passage:', error);
      return [];
    }
  }

  /**
   * Search for verses containing the query text
   *
   * Uses FTS5 if available, otherwise falls back to indexed LIKE search
   */
  async searchVerses(query: string, limit: number = 50): Promise<Verse[]> {
    try {
      if (this.ftsAvailable) {
        return this.searchWithFTS5(query, limit);
      } else {
        return this.searchWithLike(query, limit);
      }
    } catch (error) {
      console.error('Error searching verses:', error);
      return [];
    }
  }

  /**
   * Search using FTS5 full-text index
   */
  private searchWithFTS5(query: string, limit: number): Verse[] {
    const rows = this.dbAdapter.getAll<{
      book_id: number;
      chapter: number;
      verse: number;
      text: string;
    }>(
      `SELECT book_id, chapter, verse, text
       FROM verses_fts
       WHERE text MATCH ?
       LIMIT ?`,
      [query, limit]
    );

    return rows.map((row) => ({
      ref: {
        book: this.getBookValueFromId(row.book_id),
        chapter: row.chapter,
        verse: row.verse,
      },
      text: row.text,
      translation: 'WEB',
    }));
  }

  /**
   * Search using LIKE with indexed lookup
   */
  private searchWithLike(query: string, limit: number): Verse[] {
    const searchPattern = `%${query}%`;

    const rows = this.dbAdapter.getAll<{
      book_id: number;
      chapter: number;
      verse: number;
      text: string;
    }>(
      `SELECT book_id, chapter, verse, text
       FROM verses
       WHERE text LIKE ?
       LIMIT ?`,
      [searchPattern, limit]
    );

    return rows.map((row) => ({
      ref: {
        book: this.getBookValueFromId(row.book_id),
        chapter: row.chapter,
        verse: row.verse,
      },
      text: row.text,
      translation: 'WEB',
    }));
  }

  /**
   * Get book ID (1-66) from BibleBook value (string)
   */
  private getBookIdFromValue(book: string): number | null {
    const canonical = CANONICAL_BOOKS.find((b) => b.name === book);
    return canonical ? canonical.order : null;
  }

  /**
   * Get BibleBook value (string) from book ID
   */
  private getBookValueFromId(bookId: number): BibleBookValue {
    const canonical = CANONICAL_BOOKS.find((b) => b.order === bookId);
    if (!canonical) return 'Genesis' as BibleBookValue;
    return canonical.name as BibleBookValue;
  }

  /**
   * Get total verse count (for integrity checking)
   */
  public getVerseCount(): number {
    try {
      const result = this.dbAdapter.getFirst<{ count: number }>(
        `SELECT COUNT(*) as count FROM verses`
      );
      return result?.count || 0;
    } catch (error) {
      console.error('Error getting verse count:', error);
      return 0;
    }
  }

  /**
   * Get total book count (for integrity checking)
   */
  public getBookCount(): number {
    try {
      const result = this.dbAdapter.getFirst<{ count: number }>(
        `SELECT COUNT(*) as count FROM books`
      );
      return result?.count || 0;
    } catch (error) {
      console.error('Error getting book count:', error);
      return 0;
    }
  }

  /**
   * Get metadata value
   */
  public getMetadata(key: string): string | null {
    try {
      const result = this.dbAdapter.getFirst<{ value: string }>(
        `SELECT value FROM translation_metadata WHERE key = ?`,
        [key]
      );
      return result?.value || null;
    } catch (error) {
      console.error('Error getting metadata:', error);
      return null;
    }
  }
}
