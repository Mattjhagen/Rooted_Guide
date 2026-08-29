import { Highlight, VerseRef, HighlightColor } from '../models';

/**
 * Repository interface for persisting verse highlights
 */
export interface HighlightRepository {
  /**
   * Get all highlights
   */
  getAllHighlights(): Promise<Highlight[]>;

  /**
   * Get highlight for a specific verse (if any)
   */
  getHighlight(ref: VerseRef): Promise<Highlight | null>;

  /**
   * Add or update a highlight
   */
  setHighlight(ref: VerseRef, color: HighlightColor): Promise<Highlight>;

  /**
   * Remove a highlight
   */
  removeHighlight(id: string): Promise<void>;
}
