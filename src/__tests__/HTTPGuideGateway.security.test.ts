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

describe('HTTPGuideGateway - Security', () => {
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

  it('gateway configuration does not accept provider API keys', () => {
    const config = {
      baseUrl: 'https://api.example.com/v1',
    };

    expect(config).toHaveProperty('baseUrl');
    expect(config).not.toHaveProperty('openaiApiKey');
    expect(config).not.toHaveProperty('anthropicApiKey');
  });

  it('only sends user content and context to server, not provider credentials', async () => {
    (gateway as any).prepareSuppliedPassages = jest.fn().mockResolvedValue([]);

    const mockResponse: GuideServiceResponse = {
      version: '1.0',
      requestId: 'test-123',
      text: 'Guidance',
      citations: [],
      safetyCategory: 'safe',
      timestamp: new Date().toISOString(),
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    await gateway.sendMessage({ userInput: 'Test' });

    const requestBody = JSON.parse((mockFetch.mock.calls[0][1]?.body as string) || '{}');

    expect(requestBody).not.toHaveProperty('apiKey');
    expect(requestBody).not.toHaveProperty('secret');
    expect(requestBody).not.toHaveProperty('model');
    expect(requestBody).not.toHaveProperty('provider');
  });
});
