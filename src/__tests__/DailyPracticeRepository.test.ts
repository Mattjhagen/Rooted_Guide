/**
 * DailyPracticeRepository Tests
 *
 * Tests for daily practice session tracking:
 * - Create and retrieve sessions
 * - Track module completion
 * - Restore interrupted sessions
 */

import Database from 'better-sqlite3';
import { SQLiteDailyPracticeRepository } from '@/infrastructure/persistence';
import {
  USER_DATA_SCHEMA_INIT_SQL,
  USER_DATA_SCHEMA_VERSION,
  insertSchemaVersion,
} from '@/infrastructure/persistence/userDataSchema';

describe('SQLiteDailyPracticeRepository', () => {
  let db: Database.Database;
  let repository: SQLiteDailyPracticeRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    db.exec(USER_DATA_SCHEMA_INIT_SQL);
    db.exec(insertSchemaVersion(USER_DATA_SCHEMA_VERSION));

    repository = new SQLiteDailyPracticeRepository(db as any);
  });

  afterEach(() => {
    db.close();
  });

  describe('createSession', () => {
    it('should create a new session', async () => {
      const today = new Date().toISOString().split('T')[0];

      const session = await repository.createSession(today);

      expect(session.id).toBeTruthy();
      expect(session.date).toBe(today);
      expect(session.startedAt).toBeInstanceOf(Date);
      expect(session.completedAt).toBeUndefined();
      expect(session.lastModule).toBeUndefined();
    });
  });

  describe('getSession', () => {
    it('should retrieve session by ID', async () => {
      const today = new Date().toISOString().split('T')[0];
      const created = await repository.createSession(today);

      const retrieved = await repository.getSession(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.date).toBe(today);
    });

    it('should return null for non-existent session', async () => {
      const session = await repository.getSession('nonexistent');

      expect(session).toBeNull();
    });
  });

  describe('getSessionByDate', () => {
    it('should retrieve session by date', async () => {
      const date = '2026-08-31';
      const created = await repository.createSession(date);

      const retrieved = await repository.getSessionByDate(date);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.date).toBe(date);
    });

    it('should return null for date with no session', async () => {
      const session = await repository.getSessionByDate('2026-01-01');

      expect(session).toBeNull();
    });
  });

  describe('getTodaySession', () => {
    it("should retrieve today's session", async () => {
      const today = new Date().toISOString().split('T')[0];
      const created = await repository.createSession(today);

      const retrieved = await repository.getTodaySession();

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should return null when no session today', async () => {
      const session = await repository.getTodaySession();

      expect(session).toBeNull();
    });
  });

  describe('updateSession', () => {
    it('should update last module', async () => {
      const today = new Date().toISOString().split('T')[0];
      const session = await repository.createSession(today);

      await repository.updateSession(session.id, { lastModule: 'reflect' });

      const updated = await repository.getSession(session.id);
      expect(updated?.lastModule).toBe('reflect');
    });

    it('should mark session as completed', async () => {
      const today = new Date().toISOString().split('T')[0];
      const session = await repository.createSession(today);
      const completedAt = new Date();

      await repository.updateSession(session.id, { completedAt });

      const updated = await repository.getSession(session.id);
      expect(updated?.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('module tracking', () => {
    it('should mark module as completed', async () => {
      const today = new Date().toISOString().split('T')[0];
      const session = await repository.createSession(today);

      await repository.completeModule(session.id, 'arrive');

      const modules = await repository.getSessionModules(session.id);
      expect(modules).toHaveLength(1);
      expect(modules[0].moduleType).toBe('arrive');
      expect(modules[0].completedAt).toBeInstanceOf(Date);
    });

    it('should track multiple modules', async () => {
      const today = new Date().toISOString().split('T')[0];
      const session = await repository.createSession(today);

      await repository.completeModule(session.id, 'arrive');
      await repository.completeModule(session.id, 'read');
      await repository.completeModule(session.id, 'reflect');

      const modules = await repository.getSessionModules(session.id);
      expect(modules).toHaveLength(3);
      expect(modules.map((m) => m.moduleType)).toEqual(['arrive', 'read', 'reflect']);
    });

    it('should update session lastModule when completing module', async () => {
      const today = new Date().toISOString().split('T')[0];
      const session = await repository.createSession(today);

      await repository.completeModule(session.id, 'arrive');

      const updated = await repository.getSession(session.id);
      expect(updated?.lastModule).toBe('arrive');
    });
  });

  describe('getIncompleteSessions', () => {
    it('should return incomplete sessions', async () => {
      const date1 = '2026-08-30';
      const date2 = '2026-08-31';

      await repository.createSession(date1);
      await repository.createSession(date2);

      const incomplete = await repository.getIncompleteSessions();
      expect(incomplete).toHaveLength(2);
    });

    it('should not return completed sessions', async () => {
      const date1 = '2026-08-30';
      const date2 = '2026-08-31';

      const session1 = await repository.createSession(date1);
      await repository.createSession(date2);

      await repository.updateSession(session1.id, { completedAt: new Date() });

      const incomplete = await repository.getIncompleteSessions();
      expect(incomplete).toHaveLength(1);
      expect(incomplete[0].date).toBe(date2);
    });

    it('should limit results', async () => {
      for (let i = 0; i < 10; i++) {
        await repository.createSession(`2026-08-${20 + i}`);
      }

      const incomplete = await repository.getIncompleteSessions(3);
      expect(incomplete).toHaveLength(3);
    });

    it('should sort by most recent first', async () => {
      const date1 = '2026-08-30';
      const date2 = '2026-08-31';

      await repository.createSession(date1);
      await new Promise((resolve) => setTimeout(resolve, 10));
      await repository.createSession(date2);

      const incomplete = await repository.getIncompleteSessions();
      expect(incomplete[0].date).toBe(date2);
      expect(incomplete[1].date).toBe(date1);
    });
  });
});
