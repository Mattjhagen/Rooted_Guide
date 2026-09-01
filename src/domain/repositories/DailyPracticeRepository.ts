/**
 * Repository interface for persisting daily practice sessions
 *
 * Tracks the user's progress through the daily path:
 * - Arrive, Read, Reflect, Respond, Close modules
 * - Completion status
 * - Ability to restore interrupted sessions
 */

export interface DailySession {
  id: string;
  date: string;
  startedAt: Date;
  completedAt?: Date;
  nextDevotionalAvailableAt?: Date;
  lastModule?: 'arrive' | 'read' | 'reflect' | 'respond' | 'close';
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyModule {
  id: string;
  sessionId: string;
  moduleType: 'arrive' | 'read' | 'reflect' | 'respond' | 'close';
  completedAt?: Date;
  createdAt: Date;
}

export interface DailyPracticeRepository {
  /**
   * Get today's session (if exists)
   */
  getTodaySession(): Promise<DailySession | null>;

  /**
   * Get session by ID
   */
  getSession(id: string): Promise<DailySession | null>;

  /**
   * Get session by date (YYYY-MM-DD)
   */
  getSessionByDate(date: string): Promise<DailySession | null>;

  /**
   * Create a new session
   */
  createSession(date: string): Promise<DailySession>;

  /**
   * Update session progress
   */
  updateSession(
    id: string,
    updates: {
      lastModule?: 'arrive' | 'read' | 'reflect' | 'respond' | 'close';
      completedAt?: Date;
      nextDevotionalAvailableAt?: Date;
    }
  ): Promise<void>;

  /**
   * Get modules for a session
   */
  getSessionModules(sessionId: string): Promise<DailyModule[]>;

  /**
   * Mark a module as completed
   */
  completeModule(
    sessionId: string,
    moduleType: 'arrive' | 'read' | 'reflect' | 'respond' | 'close'
  ): Promise<void>;

  /**
   * Get incomplete sessions (for "Continue where you left off")
   */
  getIncompleteSessions(limit?: number): Promise<DailySession[]>;
}
