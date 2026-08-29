import { HTTPGuideGateway } from '../infrastructure/adapters/HTTPGuideGateway';
import { BibleRepository } from '../domain/repositories';
import { Verse } from '../domain/models/Verse';

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

describe('HTTPGuideGateway - Malformed Response Handling', () => {
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

  it('rejects response missing required fields', async () => {
    (gateway as any).prepareSuppliedPassages = jest.fn().mockResolvedValue([]);

    const malformedResponse = {
      requestId: 'test-123',
      citations: [],
    };

    mockFetch.mockImplementation(
      async () =>
        ({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => malformedResponse,
        }) as Response
    );

    await expect(gateway.sendMessage({ userInput: 'Test' })).rejects.toThrow(/Malformed/);
  });

  it('rejects response with non-array citations', async () => {
    (gateway as any).prepareSuppliedPassages = jest.fn().mockResolvedValue([]);

    const invalidResponse = {
      version: '1.0',
      requestId: 'test-123',
      text: 'Guidance',
      citations: 'not-an-array',
      safetyCategory: 'safe',
      timestamp: new Date().toISOString(),
    };

    mockFetch.mockImplementation(
      async () =>
        ({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => invalidResponse,
        }) as Response
    );

    await expect(gateway.sendMessage({ userInput: 'Test' })).rejects.toThrow(
      /citations must be an array/
    );
  });
});
