import * as SQLite from 'expo-sqlite';
import { NotesRepository } from '@/domain/repositories';
import { Note, NoteKind, VerseRef } from '@/domain/models';
import { createDBAdapter, DBAdapter } from './dbAdapter';

/**
 * SQLite implementation of NotesRepository
 *
 * Persists user notes (reflections and prayers) to local SQLite database.
 * Supports soft deletion for future sync needs.
 */
export class SQLiteNotesRepository implements NotesRepository {
  private dbAdapter: DBAdapter;

  constructor(db: SQLite.SQLiteDatabase | any) {
    this.dbAdapter = createDBAdapter(db);
  }

  /**
   * Get a note by ID
   */
  async getNote(id: string): Promise<Note | null> {
    try {
      const row = this.dbAdapter.getFirst<{
        id: string;
        kind: string;
        content: string;
        book: string | null;
        chapter: number | null;
        verse: number | null;
        created_at: string;
        updated_at: string;
      }>(
        `SELECT id, kind, content, book, chapter, verse, created_at, updated_at
         FROM notes
         WHERE id = ? AND deleted_at IS NULL`,
        [id]
      );

      if (!row) return null;

      return this.mapRowToNote(row);
    } catch (error) {
      console.error('Error getting note:', error);
      return null;
    }
  }

  /**
   * Get all notes, sorted by most recent
   */
  async getAllNotes(): Promise<Note[]> {
    try {
      const rows = this.dbAdapter.getAll<{
        id: string;
        kind: string;
        content: string;
        book: string | null;
        chapter: number | null;
        verse: number | null;
        created_at: string;
        updated_at: string;
      }>(
        `SELECT id, kind, content, book, chapter, verse, created_at, updated_at
         FROM notes
         WHERE deleted_at IS NULL
         ORDER BY created_at DESC`
      );

      return rows.map(this.mapRowToNote);
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  }

  /**
   * Create a new note
   */
  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    try {
      const id = `note_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const now = new Date().toISOString();

      this.dbAdapter.run(
        `INSERT INTO notes (id, kind, content, book, chapter, verse, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          note.kind,
          note.content,
          note.verseRef?.book || null,
          note.verseRef?.chapter || null,
          note.verseRef?.verse || null,
          now,
          now,
        ]
      );

      return {
        id,
        kind: note.kind,
        content: note.content,
        verseRef: note.verseRef,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      };
    } catch (error) {
      console.error('Error creating note:', error);
      throw new Error('Failed to create note');
    }
  }

  /**
   * Update an existing note
   */
  async updateNote(id: string, content: string): Promise<void> {
    try {
      const now = new Date().toISOString();

      this.dbAdapter.run(
        `UPDATE notes
         SET content = ?, updated_at = ?
         WHERE id = ? AND deleted_at IS NULL`,
        [content, now, id]
      );
    } catch (error) {
      console.error('Error updating note:', error);
      throw new Error('Failed to update note');
    }
  }

  /**
   * Delete a note (soft delete)
   */
  async deleteNote(id: string): Promise<void> {
    try {
      const now = new Date().toISOString();

      this.dbAdapter.run(
        `UPDATE notes
         SET deleted_at = ?
         WHERE id = ?`,
        [now, id]
      );
    } catch (error) {
      console.error('Error deleting note:', error);
      throw new Error('Failed to delete note');
    }
  }

  /**
   * Hard delete a note (for testing and data management)
   */
  async hardDeleteNote(id: string): Promise<void> {
    try {
      this.dbAdapter.run(`DELETE FROM notes WHERE id = ?`, [id]);
    } catch (error) {
      console.error('Error hard deleting note:', error);
      throw new Error('Failed to hard delete note');
    }
  }

  /**
   * Map database row to Note model
   */
  private mapRowToNote(row: {
    id: string;
    kind: string;
    content: string;
    book: string | null;
    chapter: number | null;
    verse: number | null;
    created_at: string;
    updated_at: string;
  }): Note {
    let verseRef: VerseRef | undefined;

    if (row.book && row.chapter && row.verse) {
      verseRef = {
        book: row.book as any,
        chapter: row.chapter,
        verse: row.verse,
      };
    }

    return {
      id: row.id,
      kind: row.kind as NoteKind,
      content: row.content,
      verseRef,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
