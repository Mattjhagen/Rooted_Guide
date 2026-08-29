import { Note } from '../models';

/**
 * Repository interface for persisting user notes
 */
export interface NotesRepository {
  /**
   * Get a note by ID
   */
  getNote(id: string): Promise<Note | null>;

  /**
   * Get all notes, sorted by most recent
   */
  getAllNotes(): Promise<Note[]>;

  /**
   * Create a new note
   */
  createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note>;

  /**
   * Update an existing note
   */
  updateNote(id: string, content: string): Promise<void>;

  /**
   * Delete a note
   */
  deleteNote(id: string): Promise<void>;
}
