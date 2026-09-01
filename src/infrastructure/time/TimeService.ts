/**
 * Time Service
 *
 * Provides injectable time source for testable date/time logic.
 * Used for 12-hour devotional gate calculations.
 */

export interface TimeService {
  getCurrentTime(): Date;
}

export class SystemTimeService implements TimeService {
  getCurrentTime(): Date {
    return new Date();
  }
}

export class MockTimeService implements TimeService {
  private mockTime: Date;

  constructor(initialTime: Date = new Date()) {
    this.mockTime = initialTime;
  }

  getCurrentTime(): Date {
    return this.mockTime;
  }

  setTime(time: Date): void {
    this.mockTime = time;
  }

  advanceBy(ms: number): void {
    this.mockTime = new Date(this.mockTime.getTime() + ms);
  }
}

const defaultTimeService = new SystemTimeService();

export function getTimeService(): TimeService {
  return defaultTimeService;
}
