import * as SQLite from 'expo-sqlite';
import { DailyPracticeRepository, DailySession, DailyModule } from '@/domain/repositories';
import { createDBAdapter, DBAdapter } from './dbAdapter';

/**
 * SQLite implementation of DailyPracticeRepository
 *
 * Tracks daily practice sessions and module completion.
 * Allows restoring interrupted sessions.
 */
export class SQLiteDailyPracticeRepository implements DailyPracticeRepository {
  private dbAdapter: DBAdapter;

  constructor(db: SQLite.SQLiteDatabase | any) {
    this.dbAdapter = createDBAdapter(db);
  }

  /**
   * Get today's session
   */
  async getTodaySession(): Promise<DailySession | null> {
    const today = new Date().toISOString().split('T')[0];
    return this.getSessionByDate(today);
  }

  /**
   * Get session by ID
   */
  async getSession(id: string): Promise<DailySession | null> {
    try {
      const row = this.dbAdapter.getFirst<{
        id: string;
        date: string;
        started_at: string;
        completed_at: string | null;
        next_devotional_available_at: string | null;
        last_module: string | null;
        created_at: string;
        updated_at: string;
      }>(
        `SELECT id, date, started_at, completed_at, next_devotional_available_at, last_module, created_at, updated_at
         FROM daily_sessions
         WHERE id = ?`,
        [id]
      );

      if (!row) return null;

      return this.mapRowToSession(row);
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Get session by date
   */
  async getSessionByDate(date: string): Promise<DailySession | null> {
    try {
      const row = this.dbAdapter.getFirst<{
        id: string;
        date: string;
        started_at: string;
        completed_at: string | null;
        next_devotional_available_at: string | null;
        last_module: string | null;
        created_at: string;
        updated_at: string;
      }>(
        `SELECT id, date, started_at, completed_at, next_devotional_available_at, last_module, created_at, updated_at
         FROM daily_sessions
         WHERE date = ?`,
        [date]
      );

      if (!row) return null;

      return this.mapRowToSession(row);
    } catch (error) {
      console.error('Error getting session by date:', error);
      return null;
    }
  }

  /**
   * Create a new session
   */
  async createSession(date: string): Promise<DailySession> {
    try {
      const id = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const now = new Date().toISOString();

      this.dbAdapter.run(
        `INSERT INTO daily_sessions (id, date, started_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, date, now, now, now]
      );

      return {
        id,
        date,
        startedAt: new Date(now),
        createdAt: new Date(now),
        updatedAt: new Date(now),
      };
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  /**
   * Update session progress
   */
  async updateSession(
    id: string,
    updates: {
      lastModule?: 'arrive' | 'read' | 'reflect' | 'respond' | 'close';
      completedAt?: Date;
      nextDevotionalAvailableAt?: Date;
    }
  ): Promise<void> {
    try {
      const now = new Date().toISOString();
      const parts: string[] = [];
      const params: (string | null)[] = [];

      if (updates.lastModule !== undefined) {
        parts.push('last_module = ?');
        params.push(updates.lastModule);
      }

      if (updates.completedAt !== undefined) {
        parts.push('completed_at = ?');
        params.push(updates.completedAt.toISOString());
      }

      if (updates.nextDevotionalAvailableAt !== undefined) {
        parts.push('next_devotional_available_at = ?');
        params.push(updates.nextDevotionalAvailableAt.toISOString());
      }

      if (parts.length === 0) return;

      parts.push('updated_at = ?');
      params.push(now);
      params.push(id);

      this.dbAdapter.run(`UPDATE daily_sessions SET ${parts.join(', ')} WHERE id = ?`, params);
    } catch (error) {
      console.error('Error updating session:', error);
      throw new Error('Failed to update session');
    }
  }

  /**
   * Get modules for a session
   */
  async getSessionModules(sessionId: string): Promise<DailyModule[]> {
    try {
      const rows = this.dbAdapter.getAll<{
        id: string;
        session_id: string;
        module_type: string;
        completed_at: string | null;
        created_at: string;
      }>(
        `SELECT id, session_id, module_type, completed_at, created_at
         FROM daily_modules
         WHERE session_id = ?
         ORDER BY created_at ASC`,
        [sessionId]
      );

      return rows.map((row) => ({
        id: row.id,
        sessionId: row.session_id,
        moduleType: row.module_type as 'arrive' | 'read' | 'reflect' | 'respond' | 'close',
        completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
        createdAt: new Date(row.created_at),
      }));
    } catch (error) {
      console.error('Error getting session modules:', error);
      return [];
    }
  }

  /**
   * Mark a module as completed
   */
  async completeModule(
    sessionId: string,
    moduleType: 'arrive' | 'read' | 'reflect' | 'respond' | 'close'
  ): Promise<void> {
    try {
      const id = `module_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const now = new Date().toISOString();

      this.dbAdapter.run(
        `INSERT OR REPLACE INTO daily_modules (id, session_id, module_type, completed_at, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, sessionId, moduleType, now, now]
      );

      await this.updateSession(sessionId, { lastModule: moduleType });
    } catch (error) {
      console.error('Error completing module:', error);
      throw new Error('Failed to complete module');
    }
  }

  /**
   * Get incomplete sessions
   */
  async getIncompleteSessions(limit: number = 5): Promise<DailySession[]> {
    try {
      const rows = this.dbAdapter.getAll<{
        id: string;
        date: string;
        started_at: string;
        completed_at: string | null;
        next_devotional_available_at: string | null;
        last_module: string | null;
        created_at: string;
        updated_at: string;
      }>(
        `SELECT id, date, started_at, completed_at, next_devotional_available_at, last_module, created_at, updated_at
         FROM daily_sessions
         WHERE completed_at IS NULL
         ORDER BY started_at DESC
         LIMIT ?`,
        [limit]
      );

      return rows.map(this.mapRowToSession);
    } catch (error) {
      console.error('Error getting incomplete sessions:', error);
      return [];
    }
  }

  /**
   * Map database row to DailySession
   */
  private mapRowToSession(row: {
    id: string;
    date: string;
    started_at: string;
    completed_at: string | null;
    next_devotional_available_at: string | null;
    last_module: string | null;
    created_at: string;
    updated_at: string;
  }): DailySession {
    return {
      id: row.id,
      date: row.date,
      startedAt: new Date(row.started_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      nextDevotionalAvailableAt: row.next_devotional_available_at
        ? new Date(row.next_devotional_available_at)
        : undefined,
      lastModule: row.last_module as
        'arrive' | 'read' | 'reflect' | 'respond' | 'close' | undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
