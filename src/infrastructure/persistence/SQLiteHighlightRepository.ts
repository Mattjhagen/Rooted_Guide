import * as SQLite from 'expo-sqlite';
import { HighlightRepository } from '@/domain/repositories';
import { Highlight, HighlightColor, VerseRef } from '@/domain/models';
import { createDBAdapter, DBAdapter } from './dbAdapter';

/**
 * SQLite implementation of HighlightRepository
 *
 * Persists verse highlights to local SQLite database.
 * Uses canonical verse references (book name, chapter, verse).
 */
export class SQLiteHighlightRepository implements HighlightRepository {
  private dbAdapter: DBAdapter;

  constructor(db: SQLite.SQLiteDatabase | any) {
    this.dbAdapter = createDBAdapter(db);
  }

  /**
   * Get all highlights, sorted by most recent
   */
  async getAllHighlights(): Promise<Highlight[]> {
    try {
      const rows = this.dbAdapter.getAll<{
        id: string;
        book: string;
        chapter: number;
        verse: number;
        color: HighlightColor;
        created_at: string;
      }>(
        `SELECT id, book, chapter, verse, color, created_at
         FROM highlights
         ORDER BY created_at DESC`
      );

      return rows.map((row) => ({
        id: row.id,
        verseRef: {
          book: row.book as any,
          chapter: row.chapter,
          verse: row.verse,
        },
        color: row.color,
        createdAt: new Date(row.created_at),
      }));
    } catch (error) {
      console.error('Error getting highlights:', error);
      return [];
    }
  }

  /**
   * Get highlight for a specific verse
   */
  async getHighlight(ref: VerseRef): Promise<Highlight | null> {
    try {
      const row = this.dbAdapter.getFirst<{
        id: string;
        book: string;
        chapter: number;
        verse: number;
        color: HighlightColor;
        created_at: string;
      }>(
        `SELECT id, book, chapter, verse, color, created_at
         FROM highlights
         WHERE book = ? AND chapter = ? AND verse = ?`,
        [ref.book, ref.chapter, ref.verse]
      );

      if (!row) return null;

      return {
        id: row.id,
        verseRef: {
          book: row.book as any,
          chapter: row.chapter,
          verse: row.verse,
        },
        color: row.color,
        createdAt: new Date(row.created_at),
      };
    } catch (error) {
      console.error('Error getting highlight:', error);
      return null;
    }
  }

  /**
   * Add or update a highlight
   */
  async setHighlight(ref: VerseRef, color: HighlightColor): Promise<Highlight> {
    try {
      const id = `highlight_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const createdAt = new Date().toISOString();

      this.dbAdapter.run(
        `INSERT OR REPLACE INTO highlights (id, book, chapter, verse, color, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, ref.book, ref.chapter, ref.verse, color, createdAt]
      );

      return {
        id,
        verseRef: ref,
        color,
        createdAt: new Date(createdAt),
      };
    } catch (error) {
      console.error('Error setting highlight:', error);
      throw new Error('Failed to set highlight');
    }
  }

  /**
   * Remove a highlight
   */
  async removeHighlight(id: string): Promise<void> {
    try {
      this.dbAdapter.run(`DELETE FROM highlights WHERE id = ?`, [id]);
    } catch (error) {
      console.error('Error removing highlight:', error);
      throw new Error('Failed to remove highlight');
    }
  }

  /**
   * Remove highlight by verse reference
   */
  async removeHighlightByRef(ref: VerseRef): Promise<void> {
    try {
      this.dbAdapter.run(`DELETE FROM highlights WHERE book = ? AND chapter = ? AND verse = ?`, [
        ref.book,
        ref.chapter,
        ref.verse,
      ]);
    } catch (error) {
      console.error('Error removing highlight by ref:', error);
      throw new Error('Failed to remove highlight');
    }
  }
}
