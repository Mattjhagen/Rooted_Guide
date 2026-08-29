import {
  HTTPGuideGateway,
  GuideServiceAPIError,
} from '../infrastructure/adapters/HTTPGuideGateway';
import { GuideRequest } from '../domain/models';
import { BibleRepository } from '../domain/repositories';
import { BibleBook } from '../domain/models/BibleBook';
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

describe('HTTPGuideGateway - Basic Operations', () => {
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

  describe('sendMessage', () => {
    it('sends request to server with correct structure', async () => {
      (gateway as any).prepareSuppliedPassages = jest.fn().mockResolvedValue([]);

      const mockResponse: GuideServiceResponse = {
        version: '1.0',
        requestId: 'test-123',
        text: 'Guidance text',
        citations: [],
        safetyCategory: 'safe',
        timestamp: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const request: GuideRequest = {
        userInput: 'Tell me about peace',
      };

      await gateway.sendMessage(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/v1/guide/message',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.any(String),
        })
      );

      const body = JSON.parse((mockFetch.mock.calls[0][1]?.body as string) || '{}');
      expect(body).toMatchObject({
        version: '1.0',
        userInput: 'Tell me about peace',
        requestId: expect.any(String),
      });
    });

    it('includes auth token when configured', async () => {
      gateway = new HTTPGuideGateway(
        {
          baseUrl: 'https://api.example.com/v1',
          authToken: 'test-token-123',
        },
        bibleRepo
      );

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

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        })
      );
    });

    it('validates citations and uses local Bible text', async () => {
      (gateway as any).prepareSuppliedPassages = jest
        .fn()
        .mockResolvedValue([
          { book: BibleBook.Psalms, chapter: 23, verse: 1, text: 'Supplied text' },
        ]);

      const mockResponse: GuideServiceResponse = {
        version: '1.0',
        requestId: 'test-123',
        text: 'Guidance text',
        citations: [{ book: BibleBook.Psalms, chapter: 23, verse: 1 }],
        safetyCategory: 'safe',
        timestamp: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await gateway.sendMessage({ userInput: 'Test' });

      expect(result.citations).toHaveLength(1);
      expect(result.citations[0].text).toBe('Mock verse text');
    });

    it('rejects response with fabricated citations', async () => {
      (gateway as any).prepareSuppliedPassages = jest
        .fn()
        .mockResolvedValue([
          { book: BibleBook.John, chapter: 3, verse: 16, text: 'Supplied text' },
        ]);

      const mockResponse: GuideServiceResponse = {
        version: '1.0',
        requestId: 'test-123',
        text: 'Guidance text',
        citations: [{ book: BibleBook.Matthew, chapter: 99, verse: 99 }],
        safetyCategory: 'safe',
        timestamp: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await expect(gateway.sendMessage({ userInput: 'Test' })).rejects.toThrow('invalid citations');
    });

    it('throws GuideServiceAPIError on API error', async () => {
      (gateway as any).prepareSuppliedPassages = jest.fn().mockResolvedValue([]);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: jest.fn().mockResolvedValue({
          error: {
            code: 'RATE_LIMIT',
            message: 'Rate limit exceeded',
            recoverable: true,
            retryAfter: 60,
          },
        }),
      } as unknown as Response);

      await expect(gateway.sendMessage({ userInput: 'Test' })).rejects.toThrow(
        GuideServiceAPIError
      );
    });

    it('prevents duplicate concurrent requests', async () => {
      (gateway as any).prepareSuppliedPassages = jest.fn().mockResolvedValue([]);

      const mockResponse: GuideServiceResponse = {
        version: '1.0',
        requestId: 'test-123',
        text: 'Guidance',
        citations: [],
        safetyCategory: 'safe',
        timestamp: new Date().toISOString(),
      };

      let resolveFirst: (value: any) => void;
      const firstRequest = new Promise((resolve) => {
        resolveFirst = resolve;
      });

      mockFetch.mockImplementationOnce(
        () => firstRequest.then(() => ({ ok: true, json: async () => mockResponse })) as any
      );

      const promise1 = gateway.sendMessage({ userInput: 'Test' });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const _promise2 = gateway.sendMessage({ userInput: 'Test' });

      resolveFirst!({ ok: true, json: async () => mockResponse });

      await expect(promise1).resolves.toBeDefined();
    });

    it('validates request size limit', async () => {
      (gateway as any).prepareSuppliedPassages = jest.fn().mockResolvedValue([]);

      const largeInput = 'x'.repeat(60000);

      await expect(gateway.sendMessage({ userInput: largeInput })).rejects.toThrow(
        /Request size.*exceeds maximum/
      );

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
