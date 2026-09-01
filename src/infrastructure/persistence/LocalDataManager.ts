import * as SQLite from 'expo-sqlite';
import { CLEAR_USER_DATA_SQL } from './userDataSchema';
import { createDBAdapter, DBAdapter } from './dbAdapter';

/**
 * LocalDataManager provides utilities for managing user data
 *
 * - Export all user data as JSON
 * - Delete all user data (with confirmation)
 * - Get data statistics
 */
export class LocalDataManager {
  private dbAdapter: DBAdapter;

  constructor(db: SQLite.SQLiteDatabase | any) {
    this.dbAdapter = createDBAdapter(db);
  }

  /**
   * Get data statistics for display
   */
  async getDataStats(): Promise<{
    bookmarks: number;
    highlights: number;
    notes: number;
    guideThreads: number;
    dailySessions: number;
  }> {
    try {
      const bookmarksRow = this.dbAdapter.getFirst<{ count: number }>(
        `SELECT COUNT(*) as count FROM bookmarks`
      );

      const highlightsRow = this.dbAdapter.getFirst<{ count: number }>(
        `SELECT COUNT(*) as count FROM highlights`
      );

      const notesRow = this.dbAdapter.getFirst<{ count: number }>(
        `SELECT COUNT(*) as count FROM notes WHERE deleted_at IS NULL`
      );

      const threadsRow = this.dbAdapter.getFirst<{ count: number }>(
        `SELECT COUNT(*) as count FROM guide_threads WHERE deleted_at IS NULL`
      );

      const sessionsRow = this.dbAdapter.getFirst<{ count: number }>(
        `SELECT COUNT(*) as count FROM daily_sessions`
      );

      return {
        bookmarks: bookmarksRow?.count || 0,
        highlights: highlightsRow?.count || 0,
        notes: notesRow?.count || 0,
        guideThreads: threadsRow?.count || 0,
        dailySessions: sessionsRow?.count || 0,
      };
    } catch (error) {
      console.error('Error getting data stats:', error);
      return {
        bookmarks: 0,
        highlights: 0,
        notes: 0,
        guideThreads: 0,
        dailySessions: 0,
      };
    }
  }

  /**
   * Export all user data as JSON
   *
   * Returns a complete snapshot of user data for backup or migration.
   * Does not include deleted items.
   */
  async exportData(): Promise<string> {
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        version: 1,
        preferences: this.exportPreferences(),
        bookmarks: this.exportBookmarks(),
        highlights: this.exportHighlights(),
        notes: this.exportNotes(),
        guideThreads: this.exportGuideThreads(),
        dailySessions: this.exportDailySessions(),
      };

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data');
    }
  }

  /**
   * Delete all user data
   *
   * WARNING: This is destructive and cannot be undone.
   * Should only be called after explicit user confirmation.
   */
  async deleteAllData(): Promise<void> {
    try {
      this.dbAdapter.exec(CLEAR_USER_DATA_SQL);
    } catch (error) {
      console.error('Error deleting all data:', error);
      throw new Error('Failed to delete all data');
    }
  }

  private exportPreferences(): unknown[] {
    try {
      return this.dbAdapter.getAll(`SELECT key, value FROM preferences`);
    } catch (error) {
      console.error('Error exporting preferences:', error);
      return [];
    }
  }

  private exportBookmarks(): unknown[] {
    try {
      return this.dbAdapter.getAll(`SELECT id, book, chapter, verse, created_at FROM bookmarks`);
    } catch (error) {
      console.error('Error exporting bookmarks:', error);
      return [];
    }
  }

  private exportHighlights(): unknown[] {
    try {
      return this.dbAdapter.getAll(
        `SELECT id, book, chapter, verse, color, created_at FROM highlights`
      );
    } catch (error) {
      console.error('Error exporting highlights:', error);
      return [];
    }
  }

  private exportNotes(): unknown[] {
    try {
      return this.dbAdapter.getAll(
        `SELECT id, kind, content, book, chapter, verse, created_at, updated_at
         FROM notes
         WHERE deleted_at IS NULL`
      );
    } catch (error) {
      console.error('Error exporting notes:', error);
      return [];
    }
  }

  private exportGuideThreads(): unknown[] {
    try {
      const threads = this.dbAdapter.getAll<{ id: string }>(
        `SELECT id, book, chapter, verse_start, verse_end, created_at, updated_at
         FROM guide_threads
         WHERE deleted_at IS NULL`
      );

      return threads.map((thread) => {
        const turns = this.dbAdapter.getAll<{ id: string }>(
          `SELECT id, role, content, timestamp FROM guide_turns WHERE thread_id = ?`,
          [thread.id]
        );

        const turnsWithDetails = turns.map((turn) => {
          const citations = this.dbAdapter.getAll(
            `SELECT book, chapter, verse, text FROM guide_citations WHERE turn_id = ?`,
            [turn.id]
          );

          const suggestions = this.dbAdapter.getAll(
            `SELECT type, text, book, chapter, verse FROM guide_suggestions WHERE turn_id = ?`,
            [turn.id]
          );

          return {
            ...turn,
            citations,
            suggestions,
          };
        });

        return {
          ...thread,
          turns: turnsWithDetails,
        };
      });
    } catch (error) {
      console.error('Error exporting guide threads:', error);
      return [];
    }
  }

  private exportDailySessions(): unknown[] {
    try {
      const sessions = this.dbAdapter.getAll<{ id: string }>(
        `SELECT id, date, started_at, completed_at, last_module, created_at, updated_at
         FROM daily_sessions`
      );

      return sessions.map((session) => {
        const modules = this.dbAdapter.getAll(
          `SELECT id, module_type, completed_at, created_at FROM daily_modules WHERE session_id = ?`,
          [session.id]
        );

        return {
          ...session,
          modules,
        };
      });
    } catch (error) {
      console.error('Error exporting daily sessions:', error);
      return [];
    }
  }
}
