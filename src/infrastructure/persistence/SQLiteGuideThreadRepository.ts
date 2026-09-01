import * as SQLite from 'expo-sqlite';
import { GuideThreadRepository } from '@/domain/repositories';
import {
  GuideThread,
  GuideTurn,
  ScriptureCitation,
  GuideSuggestion,
  PassageRef,
} from '@/domain/models';
import { BibleBookValue } from '@/domain/models';
import { createDBAdapter, DBAdapter } from './dbAdapter';

/**
 * SQLite implementation of GuideThreadRepository
 *
 * Persists guide conversation threads to local SQLite database.
 * Each thread is tied to a specific passage for context.
 * Supports soft deletion for future sync needs.
 */
export class SQLiteGuideThreadRepository implements GuideThreadRepository {
  private dbAdapter: DBAdapter;

  constructor(db: SQLite.SQLiteDatabase | any) {
    this.dbAdapter = createDBAdapter(db);
  }

  /**
   * Get a thread by ID
   */
  async getThread(id: string): Promise<GuideThread | null> {
    try {
      const threadRow = this.dbAdapter.getFirst<{
        id: string;
        book: string | null;
        chapter: number | null;
        verse_start: number | null;
        verse_end: number | null;
        created_at: string;
        updated_at: string;
      }>(
        `SELECT id, book, chapter, verse_start, verse_end, created_at, updated_at
         FROM guide_threads
         WHERE id = ? AND deleted_at IS NULL`,
        [id]
      );

      if (!threadRow) return null;

      const turns = await this.getThreadTurns(id);

      return {
        id: threadRow.id,
        turns,
        passageRef:
          threadRow.book && threadRow.chapter && threadRow.verse_start && threadRow.verse_end
            ? {
                book: threadRow.book as BibleBookValue,
                chapter: threadRow.chapter,
                verseStart: threadRow.verse_start,
                verseEnd: threadRow.verse_end,
              }
            : undefined,
        createdAt: new Date(threadRow.created_at),
        updatedAt: new Date(threadRow.updated_at),
      };
    } catch (error) {
      console.error('Error getting thread:', error);
      return null;
    }
  }

  /**
   * Get all threads, sorted by most recent
   */
  async getAllThreads(): Promise<GuideThread[]> {
    try {
      const threadRows = this.dbAdapter.getAll<{
        id: string;
        book: string | null;
        chapter: number | null;
        verse_start: number | null;
        verse_end: number | null;
        created_at: string;
        updated_at: string;
      }>(
        `SELECT id, book, chapter, verse_start, verse_end, created_at, updated_at
         FROM guide_threads
         WHERE deleted_at IS NULL
         ORDER BY updated_at DESC`
      );

      const threads: GuideThread[] = [];

      for (const row of threadRows) {
        const turns = await this.getThreadTurns(row.id);
        threads.push({
          id: row.id,
          turns,
          passageRef:
            row.book && row.chapter && row.verse_start && row.verse_end
              ? {
                  book: row.book as BibleBookValue,
                  chapter: row.chapter,
                  verseStart: row.verse_start,
                  verseEnd: row.verse_end,
                }
              : undefined,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        });
      }

      return threads;
    } catch (error) {
      console.error('Error getting threads:', error);
      return [];
    }
  }

  /**
   * Create a new thread
   */
  async createThread(passageRef?: PassageRef): Promise<GuideThread> {
    try {
      const id = `thread_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const now = new Date().toISOString();

      if (passageRef) {
        this.dbAdapter.run(
          `INSERT INTO guide_threads (id, book, chapter, verse_start, verse_end, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            passageRef.book,
            passageRef.chapter,
            passageRef.verseStart,
            passageRef.verseEnd,
            now,
            now,
          ]
        );
      } else {
        this.dbAdapter.run(
          `INSERT INTO guide_threads (id, created_at, updated_at)
           VALUES (?, ?, ?)`,
          [id, now, now]
        );
      }

      return {
        id,
        turns: [],
        passageRef,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      };
    } catch (error) {
      console.error('Error creating thread:', error);
      throw new Error('Failed to create thread');
    }
  }

  /**
   * Add a turn to a thread
   */
  async addTurn(threadId: string, turn: GuideTurn): Promise<void> {
    try {
      const now = new Date().toISOString();

      this.dbAdapter.run(
        `INSERT INTO guide_turns (id, thread_id, role, content, timestamp)
         VALUES (?, ?, ?, ?, ?)`,
        [turn.id, threadId, turn.role, turn.content, turn.timestamp.toISOString()]
      );

      if (turn.citations && turn.citations.length > 0) {
        for (const citation of turn.citations) {
          this.dbAdapter.run(
            `INSERT INTO guide_citations (turn_id, book, chapter, verse, text)
             VALUES (?, ?, ?, ?, ?)`,
            [turn.id, citation.book, citation.chapter, citation.verse, citation.text || null]
          );
        }
      }

      if (turn.suggestions && turn.suggestions.length > 0) {
        for (const suggestion of turn.suggestions) {
          this.dbAdapter.run(
            `INSERT INTO guide_suggestions (turn_id, type, text, book, chapter, verse)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              turn.id,
              suggestion.type,
              suggestion.text,
              suggestion.reference?.book || null,
              suggestion.reference?.chapter || null,
              suggestion.reference?.verse || null,
            ]
          );
        }
      }

      this.dbAdapter.run(`UPDATE guide_threads SET updated_at = ? WHERE id = ?`, [now, threadId]);
    } catch (error) {
      console.error('Error adding turn:', error);
      throw new Error('Failed to add turn');
    }
  }

  /**
   * Delete a thread (soft delete)
   */
  async deleteThread(id: string): Promise<void> {
    try {
      const now = new Date().toISOString();

      this.dbAdapter.run(`UPDATE guide_threads SET deleted_at = ? WHERE id = ?`, [now, id]);
    } catch (error) {
      console.error('Error deleting thread:', error);
      throw new Error('Failed to delete thread');
    }
  }

  /**
   * Get all turns for a thread
   */
  private async getThreadTurns(threadId: string): Promise<GuideTurn[]> {
    try {
      const turnRows = this.dbAdapter.getAll<{
        id: string;
        role: string;
        content: string;
        timestamp: string;
      }>(
        `SELECT id, role, content, timestamp
         FROM guide_turns
         WHERE thread_id = ?
         ORDER BY timestamp ASC`,
        [threadId]
      );

      const turns: GuideTurn[] = [];

      for (const row of turnRows) {
        const citations = this.getTurnCitations(row.id);
        const suggestions = this.getTurnSuggestions(row.id);

        turns.push({
          id: row.id,
          role: row.role as 'user' | 'guide',
          content: row.content,
          citations,
          suggestions,
          timestamp: new Date(row.timestamp),
        });
      }

      return turns;
    } catch (error) {
      console.error('Error getting turns:', error);
      return [];
    }
  }

  /**
   * Get citations for a turn
   */
  private getTurnCitations(turnId: string): ScriptureCitation[] {
    try {
      const rows = this.dbAdapter.getAll<{
        book: string;
        chapter: number;
        verse: number;
        text: string | null;
      }>(
        `SELECT book, chapter, verse, text
         FROM guide_citations
         WHERE turn_id = ?`,
        [turnId]
      );

      return rows.map((row) => ({
        book: row.book as BibleBookValue,
        chapter: row.chapter,
        verse: row.verse,
        text: row.text || undefined,
      }));
    } catch (error) {
      console.error('Error getting citations:', error);
      return [];
    }
  }

  /**
   * Get suggestions for a turn
   */
  private getTurnSuggestions(turnId: string): GuideSuggestion[] {
    try {
      const rows = this.dbAdapter.getAll<{
        type: string;
        text: string;
        book: string | null;
        chapter: number | null;
        verse: number | null;
      }>(
        `SELECT type, text, book, chapter, verse
         FROM guide_suggestions
         WHERE turn_id = ?`,
        [turnId]
      );

      return rows.map((row) => {
        const suggestion: GuideSuggestion = {
          type: row.type as 'reflection' | 'question' | 'related_verse',
          text: row.text,
        };

        if (row.book && row.chapter && row.verse) {
          suggestion.reference = {
            book: row.book as BibleBookValue,
            chapter: row.chapter,
            verse: row.verse,
          };
        }

        return suggestion;
      });
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }
}
