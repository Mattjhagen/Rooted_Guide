import * as SQLite from 'expo-sqlite';
import { ReflectionRepository } from '@/domain/repositories/ReflectionRepository';
import { Reflection, ReflectionKind } from '@/domain/models/Reflection';
import { createDBAdapter, DBAdapter } from './dbAdapter';

/**
 * SQLite implementation of ReflectionRepository
 *
 * Stores daily practice responses and drafts in reflections table.
 */
export class SQLiteReflectionRepository implements ReflectionRepository {
  private dbAdapter: DBAdapter;

  constructor(db: SQLite.SQLiteDatabase | any) {
    this.dbAdapter = createDBAdapter(db);
  }

  async getReflection(id: string): Promise<Reflection | null> {
    try {
      const row = this.dbAdapter.getFirst<{
        id: string;
        module_id: string | null;
        kind: string;
        content: string;
        book: string | null;
        chapter: number | null;
        verse: number | null;
        created_at: string;
        updated_at: string;
      }>(
        `SELECT id, module_id, kind, content, book, chapter, verse, created_at, updated_at
         FROM reflections
         WHERE id = ? AND deleted_at IS NULL`,
        [id]
      );

      if (!row) return null;

      return this.mapRowToReflection(row);
    } catch (error) {
      console.error('Error getting reflection:', error);
      return null;
    }
  }

  async getModuleDraft(moduleId: string): Promise<Reflection | null> {
    try {
      const row = this.dbAdapter.getFirst<{
        id: string;
        module_id: string | null;
        kind: string;
        content: string;
        book: string | null;
        chapter: number | null;
        verse: number | null;
        created_at: string;
        updated_at: string;
      }>(
        `SELECT id, module_id, kind, content, book, chapter, verse, created_at, updated_at
         FROM reflections
         WHERE module_id = ? AND deleted_at IS NULL
         ORDER BY updated_at DESC
         LIMIT 1`,
        [moduleId]
      );

      if (!row) return null;

      return this.mapRowToReflection(row);
    } catch (error) {
      console.error('Error getting module draft:', error);
      return null;
    }
  }

  async getSessionReflections(sessionId: string): Promise<Reflection[]> {
    try {
      const rows = this.dbAdapter.getAll<{
        id: string;
        module_id: string | null;
        kind: string;
        content: string;
        book: string | null;
        chapter: number | null;
        verse: number | null;
        created_at: string;
        updated_at: string;
      }>(
        `SELECT r.id, r.module_id, r.kind, r.content, r.book, r.chapter, r.verse,
                r.created_at, r.updated_at
         FROM reflections r
         JOIN daily_modules m ON r.module_id = m.id
         WHERE m.session_id = ? AND r.deleted_at IS NULL
         ORDER BY r.created_at ASC`,
        [sessionId]
      );

      return rows.map(this.mapRowToReflection);
    } catch (error) {
      console.error('Error getting session reflections:', error);
      return [];
    }
  }

  async getAllReflections(): Promise<Reflection[]> {
    try {
      const rows = this.dbAdapter.getAll<{
        id: string;
        module_id: string | null;
        kind: string;
        content: string;
        book: string | null;
        chapter: number | null;
        verse: number | null;
        created_at: string;
        updated_at: string;
      }>(
        `SELECT id, module_id, kind, content, book, chapter, verse, created_at, updated_at
         FROM reflections
         WHERE deleted_at IS NULL
         ORDER BY created_at DESC`
      );

      return rows.map(this.mapRowToReflection);
    } catch (error) {
      console.error('Error getting all reflections:', error);
      return [];
    }
  }

  async saveDraft(
    moduleId: string,
    kind: ReflectionKind,
    content: string,
    verseRef?: any
  ): Promise<Reflection> {
    try {
      const existing = await this.getModuleDraft(moduleId);
      const now = new Date().toISOString();

      // Extract verse reference fields
      const book = verseRef?.book || null;
      const chapter = verseRef?.chapter || null;
      const verse = 'verse' in (verseRef || {}) ? verseRef.verse : verseRef?.verseStart || null;

      if (existing) {
        this.dbAdapter.run(
          `UPDATE reflections SET content = ?, book = ?, chapter = ?, verse = ?, updated_at = ? WHERE id = ?`,
          [content, book, chapter, verse, now, existing.id]
        );

        return {
          ...existing,
          content,
          verseRef:
            book && chapter && verse
              ? {
                  book,
                  chapter,
                  verse,
                }
              : undefined,
          updatedAt: new Date(now),
        };
      } else {
        const id = `reflection_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        this.dbAdapter.run(
          `INSERT INTO reflections (id, module_id, kind, content, book, chapter, verse, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, moduleId, kind, content, book, chapter, verse, now, now]
        );

        return {
          id,
          moduleId,
          kind,
          content,
          verseRef:
            book && chapter && verse
              ? {
                  book,
                  chapter,
                  verse,
                }
              : undefined,
          createdAt: new Date(now),
          updatedAt: new Date(now),
        };
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      throw new Error('Failed to save draft');
    }
  }

  async saveResponse(
    moduleId: string,
    kind: ReflectionKind,
    content: string,
    verseRef?: any
  ): Promise<Reflection> {
    return this.saveDraft(moduleId, kind, content, verseRef);
  }

  async deleteReflection(id: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      this.dbAdapter.run(`UPDATE reflections SET deleted_at = ? WHERE id = ?`, [now, id]);
    } catch (error) {
      console.error('Error deleting reflection:', error);
      throw new Error('Failed to delete reflection');
    }
  }

  private mapRowToReflection(row: {
    id: string;
    module_id: string | null;
    kind: string;
    content: string;
    book: string | null;
    chapter: number | null;
    verse: number | null;
    created_at: string;
    updated_at: string;
  }): Reflection {
    return {
      id: row.id,
      moduleId: row.module_id || undefined,
      kind: row.kind as ReflectionKind,
      content: row.content,
      verseRef:
        row.book && row.chapter && row.verse
          ? ({
              book: row.book,
              chapter: row.chapter,
              verse: row.verse,
            } as any)
          : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
