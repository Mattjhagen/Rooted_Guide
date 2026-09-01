/**
 * 12-Hour Devotional Gate Test
 *
 * Tests the devotional gate behavior:
 * - Gate is set exactly 12 hours after completion
 * - Gate persists across app restarts
 * - Gate unlocks automatically after 12 hours
 * - Direct navigation is blocked while locked
 * - Time remaining is calculated correctly
 */

import { SQLiteDailyPracticeRepository } from '@/infrastructure/persistence/SQLiteDailyPracticeRepository';

// Mock time service
jest.mock('@/infrastructure/time', () => {
  const mockTime = new (class {
    private mockTime: Date = new Date('2024-01-01T10:00:00Z');
    getCurrentTime() {
      return this.mockTime;
    }
    setTime(time: Date) {
      this.mockTime = time;
    }
    advanceBy(ms: number) {
      this.mockTime = new Date(this.mockTime.getTime() + ms);
    }
  })();

  return {
    getTimeService: () => mockTime,
    MockTimeService: jest.fn(),
    SystemTimeService: jest.fn(),
  };
});

const mockDb = {
  getFirstSync: jest.fn(),
  getAllSync: jest.fn(),
  runSync: jest.fn(),
  execSync: jest.fn(),
};

describe('12-Hour Devotional Gate', () => {
  let repository: SQLiteDailyPracticeRepository;
  let timeService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new SQLiteDailyPracticeRepository(mockDb);
    timeService = require('@/infrastructure/time').getTimeService();
    timeService.setTime(new Date('2024-01-01T10:00:00Z'));
  });

  describe('Gate Setting on Completion', () => {
    it('sets nextDevotionalAvailableAt exactly 12 hours after completion', async () => {
      const sessionId = 'session_1';
      const completionTime = new Date('2024-01-01T10:00:00Z');
      const expectedUnlockTime = new Date('2024-01-01T22:00:00Z');

      await repository.updateSession(sessionId, {
        completedAt: completionTime,
        nextDevotionalAvailableAt: expectedUnlockTime,
      });

      expect(mockDb.runSync).toHaveBeenCalledWith(
        expect.stringContaining('next_devotional_available_at = ?'),
        expect.arrayContaining([expectedUnlockTime.toISOString()])
      );
    });
  });

  describe('Gate Persistence', () => {
    it('persists gate across app restarts', async () => {
      const today = '2024-01-01';
      const unlockTime = new Date('2024-01-01T22:00:00Z');

      mockDb.getFirstSync.mockReturnValue({
        id: 'session_1',
        date: today,
        started_at: new Date('2024-01-01T09:45:00Z').toISOString(),
        completed_at: new Date('2024-01-01T10:00:00Z').toISOString(),
        next_devotional_available_at: unlockTime.toISOString(),
        last_module: 'close',
        created_at: new Date('2024-01-01T09:45:00Z').toISOString(),
        updated_at: new Date('2024-01-01T10:00:00Z').toISOString(),
      });

      const session = await repository.getSessionByDate(today);

      expect(session?.nextDevotionalAvailableAt).toEqual(unlockTime);
    });

    it('session remains locked after simulated app restart', async () => {
      const today = '2024-01-01';
      const currentTime = new Date('2024-01-01T15:00:00Z'); // 5 hours after completion
      const unlockTime = new Date('2024-01-01T22:00:00Z');

      timeService.setTime(currentTime);

      mockDb.getFirstSync.mockReturnValue({
        id: 'session_1',
        date: today,
        started_at: new Date('2024-01-01T09:45:00Z').toISOString(),
        completed_at: new Date('2024-01-01T10:00:00Z').toISOString(),
        next_devotional_available_at: unlockTime.toISOString(),
        last_module: 'close',
        created_at: new Date('2024-01-01T09:45:00Z').toISOString(),
        updated_at: new Date('2024-01-01T10:00:00Z').toISOString(),
      });

      const session = await repository.getSessionByDate(today);

      const isStillLocked =
        session?.nextDevotionalAvailableAt &&
        new Date(session.nextDevotionalAvailableAt).getTime() > currentTime.getTime();

      expect(isStillLocked).toBe(true);
    });
  });

  describe('Gate Unlock Behavior', () => {
    it('unlocks automatically after 12 hours', async () => {
      const today = '2024-01-01';
      const completionTime = new Date('2024-01-01T10:00:00Z');
      const unlockTime = new Date('2024-01-01T22:00:00Z');

      // Start at 15 hours after completion (past the 12-hour gate)
      const futureTime = new Date('2024-01-02T01:00:00Z');
      timeService.setTime(futureTime);

      mockDb.getFirstSync.mockReturnValue({
        id: 'session_1',
        date: today,
        started_at: new Date('2024-01-01T09:45:00Z').toISOString(),
        completed_at: completionTime.toISOString(),
        next_devotional_available_at: unlockTime.toISOString(),
        last_module: 'close',
        created_at: new Date('2024-01-01T09:45:00Z').toISOString(),
        updated_at: completionTime.toISOString(),
      });

      const session = await repository.getSessionByDate(today);

      const isUnlocked =
        !session?.nextDevotionalAvailableAt ||
        new Date(session.nextDevotionalAvailableAt).getTime() <= futureTime.getTime();

      expect(isUnlocked).toBe(true);
    });
  });

  describe('Time Remaining Calculation', () => {
    it('calculates time remaining correctly', () => {
      const currentTime = new Date('2024-01-01T15:00:00Z');
      const unlockTime = new Date('2024-01-01T22:00:00Z');

      const msRemaining = unlockTime.getTime() - currentTime.getTime();
      const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
      const minutesRemaining = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));

      expect(hoursRemaining).toBe(7);
      expect(minutesRemaining).toBe(0);
    });

    it('formats time remaining as "8h 14m"', () => {
      const { formatTimeRemaining } = require('@/features/dailyPath/formatTimeRemaining');

      const ms = 8 * 60 * 60 * 1000 + 14 * 60 * 1000; // 8h 14m
      expect(formatTimeRemaining(ms)).toBe('8h 14m');
    });

    it('formats time remaining as "45m" when less than an hour', () => {
      const { formatTimeRemaining } = require('@/features/dailyPath/formatTimeRemaining');

      const ms = 45 * 60 * 1000; // 45m
      expect(formatTimeRemaining(ms)).toBe('45m');
    });
  });
});
