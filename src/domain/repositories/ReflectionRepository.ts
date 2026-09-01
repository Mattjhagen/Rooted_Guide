import { Reflection, ReflectionKind } from '../models/Reflection';
import { VerseRef, PassageRef } from '../models/VerseRef';

/**
 * Repository interface for daily practice reflections
 *
 * Handles draft auto-save and final responses tied to modules.
 * Different from NotesRepository which handles standalone user notes.
 */
export interface ReflectionRepository {
  /**
   * Get a reflection by ID
   */
  getReflection(id: string): Promise<Reflection | null>;

  /**
   * Get reflection draft for a module (most recent if multiple)
   */
  getModuleDraft(moduleId: string): Promise<Reflection | null>;

  /**
   * Get all reflections for a session
   */
  getSessionReflections(sessionId: string): Promise<Reflection[]>;

  /**
   * Get all reflections (for saved items screen)
   */
  getAllReflections(): Promise<Reflection[]>;

  /**
   * Save or update a draft (auto-save)
   */
  saveDraft(
    moduleId: string,
    kind: ReflectionKind,
    content: string,
    verseRef?: VerseRef | PassageRef
  ): Promise<Reflection>;

  /**
   * Save final response when completing module
   */
  saveResponse(
    moduleId: string,
    kind: ReflectionKind,
    content: string,
    verseRef?: VerseRef | PassageRef
  ): Promise<Reflection>;

  /**
   * Delete a reflection
   */
  deleteReflection(id: string): Promise<void>;
}
