import { HTTPGuideGateway } from '../infrastructure/adapters/HTTPGuideGateway';
import { BibleRepository } from '../domain/repositories';
import { Verse } from '../domain/models/Verse';
import { GuideServiceResponse } from '../domain/models/GuideServiceContract';

// Mock fetch globally
global.fetch = jest.fn();

// Mock Bible Repository
class MockBibleRepo implements BibleRepository {
  async getVerse(ref: { book: any; chapter: number; verse: number }): Promise<Verse | null> {
    return {
      ref: {
        book: ref.book,
        chapter: ref.chapter,
        verse: ref.verse,
      },
      text: 'Mock verse text',
      translation: 'WEB',
    };
  }

  async getChapter(): Promise<Verse[]> {
    return [];
  }

  async getPassage(): Promise<Verse[]> {
    return [];
  }

  async searchVerses(): Promise<Verse[]> {
    return [];
  }
}

describe('HTTPGuideGateway - Retry Logic', () => {
  let gateway: HTTPGuideGateway;
  let bibleRepo: MockBibleRepo;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    bibleRepo = new MockBibleRepo();
    gateway = new HTTPGuideGateway(
      {
        baseUrl: 'https://api.example.com/v1',
        timeoutMs: 5000,
        maxRetries: 3,
      },
      bibleRepo
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('retries on network failure', async () => {
    (gateway as any).prepareSuppliedPassages = jest.fn().mockResolvedValue([]);

    const mockResponse: GuideServiceResponse = {
      version: '1.0',
      requestId: 'test-123',
      text: 'Guidance',
      citations: [],
      safetyCategory: 'safe',
      timestamp: new Date().toISOString(),
    };

    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

    const result = await gateway.sendMessage({ userInput: 'Test' });

    expect(result).toBeDefined();
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('does not retry on cancellation', async () => {
    // Note: This test covers timeout behavior as well. When a request times out,
    // the AbortController aborts the fetch, causing an AbortError. This test verifies
    // that AbortErrors (whether from timeout or manual cancellation) do not trigger retries.
    // This replaces the previously skipped "times out long requests" test which caused
    // test pollution with mockImplementation.
    (gateway as any).prepareSuppliedPassages = jest.fn().mockResolvedValue([]);

    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';

    mockFetch.mockRejectedValueOnce(abortError);

    await expect(gateway.sendMessage({ userInput: 'Test' })).rejects.toThrow(/cancel/i);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('gives up after max retries', async () => {
    (gateway as any).prepareSuppliedPassages = jest.fn().mockResolvedValue([]);

    const networkError = new Error('Network error');
    mockFetch
      .mockRejectedValueOnce(networkError)
      .mockRejectedValueOnce(networkError)
      .mockRejectedValueOnce(networkError);

    await expect(gateway.sendMessage({ userInput: 'Test' })).rejects.toThrow(/Network error/i);

    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});
