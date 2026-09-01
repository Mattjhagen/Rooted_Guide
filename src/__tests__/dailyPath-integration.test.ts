/**
 * Integration tests for daily path flow
 *
 * Tests the complete user journey:
 * 1. Starting a daily practice session
 * 2. Auto-saving drafts as user types
 * 3. Completing modules and persisting responses
 * 4. Restoring interrupted sessions
 */

import { SQLiteDailyPracticeRepository } from '@/infrastructure/persistence/SQLiteDailyPracticeRepository';
import { SQLiteReflectionRepository } from '@/infrastructure/persistence/SQLiteReflectionRepository';

describe('Daily Path Integration', () => {
  let db: any;
  let dailyPracticeRepo: SQLiteDailyPracticeRepository;
  let reflectionRepo: SQLiteReflectionRepository;

  beforeEach(() => {
    db = {
      getFirstSync: jest.fn(),
      getAllSync: jest.fn(),
      runSync: jest.fn(),
      execSync: jest.fn(),
    };
    dailyPracticeRepo = new SQLiteDailyPracticeRepository(db);
    reflectionRepo = new SQLiteReflectionRepository(db);
  });

  describe('Session creation and restoration', () => {
    it('creates new session for today if none exists', async () => {
      db.getFirstSync.mockReturnValue(null);

      const session = await dailyPracticeRepo.createSession('2026-08-31');

      expect(db.runSync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO daily_sessions'),
        expect.any(Array)
      );
      expect(session.date).toBe('2026-08-31');
    });

    it('restores incomplete session on relaunch', async () => {
      const incompleteSession = {
        id: 'session_123',
        date: '2026-08-31',
        started_at: new Date().toISOString(),
        completed_at: null,
        last_module: 'reflect',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.getFirstSync.mockReturnValue(incompleteSession);

      const session = await dailyPracticeRepo.getTodaySession();

      expect(session).not.toBeNull();
      expect(session?.lastModule).toBe('reflect');
      expect(session?.completedAt).toBeUndefined();
    });
  });

  describe('Draft autosave', () => {
    it('saves draft when user types', async () => {
      db.getFirstSync.mockReturnValue(null);

      await reflectionRepo.saveDraft('module_123', 'reflection', 'My initial thought');

      expect(db.runSync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO reflections'),
        expect.arrayContaining([
          expect.any(String),
          'module_123',
          'reflection',
          'My initial thought',
        ])
      );
    });

    it('updates draft on subsequent saves', async () => {
      const existingDraft = {
        id: 'reflection_123',
        module_id: 'module_123',
        kind: 'reflection',
        content: 'Initial',
        book: null,
        chapter: null,
        verse: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.getFirstSync.mockReturnValue(existingDraft);

      await reflectionRepo.saveDraft('module_123', 'reflection', 'Updated text');

      expect(db.runSync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE reflections'),
        expect.arrayContaining(['Updated text'])
      );
    });

    it('restores draft when returning to module', async () => {
      const savedDraft = {
        id: 'reflection_123',
        module_id: 'module_123',
        kind: 'reflection',
        content: 'Previously saved draft',
        book: null,
        chapter: null,
        verse: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      db.getFirstSync.mockReturnValue(savedDraft);

      const draft = await reflectionRepo.getModuleDraft('module_123');

      expect(draft?.content).toBe('Previously saved draft');
    });
  });

  describe('Module completion', () => {
    it('marks module as complete and advances to next', async () => {
      await dailyPracticeRepo.completeModule('session_123', 'arrive');

      expect(db.runSync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO daily_modules'),
        expect.any(Array)
      );
    });

    it('saves final response when completing module', async () => {
      db.getFirstSync.mockReturnValue(null);

      await reflectionRepo.saveResponse('module_123', 'reflection', 'Final reflection');

      expect(db.runSync).toHaveBeenCalled();
    });

    it('marks session complete after last module', async () => {
      await dailyPracticeRepo.updateSession('session_123', {
        completedAt: new Date(),
      });

      expect(db.runSync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE daily_sessions'),
        expect.arrayContaining([expect.any(String)])
      );
    });
  });
});
