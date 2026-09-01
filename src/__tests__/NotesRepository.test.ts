/**
 * NotesRepository Tests
 *
 * Tests for SQLite notes persistence:
 * - Create/read/update/delete notes
 * - Reflections and prayers
 * - Soft deletion
 * - Notes with and without verse references
 */

import Database from 'better-sqlite3';
import { SQLiteNotesRepository } from '@/infrastructure/persistence';
import {
  USER_DATA_SCHEMA_INIT_SQL,
  USER_DATA_SCHEMA_VERSION,
  insertSchemaVersion,
} from '@/infrastructure/persistence/userDataSchema';
import { NoteKind, VerseRef } from '@/domain/models';

describe('SQLiteNotesRepository', () => {
  let db: Database.Database;
  let repository: SQLiteNotesRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(USER_DATA_SCHEMA_INIT_SQL);
    db.exec(insertSchemaVersion(USER_DATA_SCHEMA_VERSION));

    repository = new SQLiteNotesRepository(db as any);
  });

  afterEach(() => {
    db.close();
  });

  describe('createNote', () => {
    it('should create a note with verse reference', async () => {
      const verseRef: VerseRef = { book: 'John', chapter: 3, verse: 16 };
      const note = await repository.createNote({
        kind: NoteKind.Reflection,
        content: 'This verse speaks to me...',
        verseRef,
      });

      expect(note.id).toBeTruthy();
      expect(note.kind).toBe(NoteKind.Reflection);
      expect(note.content).toBe('This verse speaks to me...');
      expect(note.verseRef).toEqual(verseRef);
      expect(note.createdAt).toBeInstanceOf(Date);
      expect(note.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a note without verse reference', async () => {
      const note = await repository.createNote({
        kind: NoteKind.Prayer,
        content: 'Lord, help me to...',
      });

      expect(note.id).toBeTruthy();
      expect(note.kind).toBe(NoteKind.Prayer);
      expect(note.content).toBe('Lord, help me to...');
      expect(note.verseRef).toBeUndefined();
    });
  });

  describe('getNote', () => {
    it('should retrieve note by ID', async () => {
      const created = await repository.createNote({
        kind: NoteKind.Reflection,
        content: 'Test note',
      });

      const retrieved = await repository.getNote(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.content).toBe('Test note');
    });

    it('should return null for non-existent note', async () => {
      const note = await repository.getNote('nonexistent');

      expect(note).toBeNull();
    });

    it('should not return soft-deleted notes', async () => {
      const created = await repository.createNote({
        kind: NoteKind.Reflection,
        content: 'Test note',
      });

      await repository.deleteNote(created.id);
      const retrieved = await repository.getNote(created.id);

      expect(retrieved).toBeNull();
    });
  });

  describe('getAllNotes', () => {
    it('should return all non-deleted notes', async () => {
      await repository.createNote({
        kind: NoteKind.Reflection,
        content: 'Note 1',
      });

      await repository.createNote({
        kind: NoteKind.Prayer,
        content: 'Note 2',
      });

      const notes = await repository.getAllNotes();

      expect(notes).toHaveLength(2);
    });

    it('should sort by most recent first', async () => {
      const note1 = await repository.createNote({
        kind: NoteKind.Reflection,
        content: 'Note 1',
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const note2 = await repository.createNote({
        kind: NoteKind.Reflection,
        content: 'Note 2',
      });

      const notes = await repository.getAllNotes();

      expect(notes[0].id).toBe(note2.id);
      expect(notes[1].id).toBe(note1.id);
    });

    it('should not return soft-deleted notes', async () => {
      const note1 = await repository.createNote({
        kind: NoteKind.Reflection,
        content: 'Note 1',
      });

      await repository.createNote({
        kind: NoteKind.Reflection,
        content: 'Note 2',
      });

      await repository.deleteNote(note1.id);
      const notes = await repository.getAllNotes();

      expect(notes).toHaveLength(1);
      expect(notes[0].content).toBe('Note 2');
    });

    it('should return empty array when no notes', async () => {
      const notes = await repository.getAllNotes();

      expect(notes).toEqual([]);
    });
  });

  describe('updateNote', () => {
    it('should update note content', async () => {
      const note = await repository.createNote({
        kind: NoteKind.Reflection,
        content: 'Original content',
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      await repository.updateNote(note.id, 'Updated content');
      const updated = await repository.getNote(note.id);

      expect(updated?.content).toBe('Updated content');
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(note.updatedAt.getTime());
    });

    it('should not update non-existent note', async () => {
      await expect(repository.updateNote('nonexistent', 'Content')).resolves.not.toThrow();
    });

    it('should not update soft-deleted note', async () => {
      const note = await repository.createNote({
        kind: NoteKind.Reflection,
        content: 'Original content',
      });

      await repository.deleteNote(note.id);
      await repository.updateNote(note.id, 'Updated content');

      const retrieved = await repository.getNote(note.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('deleteNote', () => {
    it('should soft delete note', async () => {
      const note = await repository.createNote({
        kind: NoteKind.Reflection,
        content: 'Test note',
      });

      await repository.deleteNote(note.id);

      const retrieved = await repository.getNote(note.id);
      expect(retrieved).toBeNull();

      const allNotes = await repository.getAllNotes();
      expect(allNotes).toHaveLength(0);
    });

    it('should not throw when deleting non-existent note', async () => {
      await expect(repository.deleteNote('nonexistent')).resolves.not.toThrow();
    });
  });

  describe('hardDeleteNote', () => {
    it('should permanently delete note', async () => {
      const note = await repository.createNote({
        kind: NoteKind.Reflection,
        content: 'Test note',
      });

      await repository.hardDeleteNote(note.id);

      const count = db.prepare('SELECT COUNT(*) as count FROM notes WHERE id = ?').get(note.id) as {
        count: number;
      };
      expect(count.count).toBe(0);
    });
  });
});
