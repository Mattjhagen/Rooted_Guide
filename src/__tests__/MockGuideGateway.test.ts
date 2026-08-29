import { MockGuideGateway } from '../infrastructure/adapters/MockGuideGateway';
import { GuideRequest } from '../domain/models';
import { BibleBook } from '../domain/models/BibleBook';

describe('MockGuideGateway', () => {
  let gateway: MockGuideGateway;

  beforeEach(() => {
    gateway = new MockGuideGateway();
  });

  it('returns anxiety response for anxiety keywords', async () => {
    const request: GuideRequest = {
      userInput: "I'm feeling anxious about tomorrow",
    };

    const response = await gateway.sendMessage(request);

    expect(response.text).toContain('anxious');
    expect(response.citations).toHaveLength(2);
    expect(response.citations[0].book).toBe(BibleBook.Psalms);
    expect(response.citations[0].chapter).toBe(23);
    expect(response.suggestions.length).toBeGreaterThan(0);
  });

  it('returns love response for love keywords', async () => {
    const request: GuideRequest = {
      userInput: "Tell me about God's love",
    };

    const response = await gateway.sendMessage(request);

    expect(response.text).toContain('love');
    expect(response.citations).toContainEqual(
      expect.objectContaining({
        book: BibleBook.John,
        chapter: 3,
        verse: 16,
      })
    );
  });

  it('returns beginning response for creation keywords', async () => {
    const request: GuideRequest = {
      userInput: 'Tell me about the beginning',
    };

    const response = await gateway.sendMessage(request);

    expect(response.citations).toContainEqual(
      expect.objectContaining({
        book: BibleBook.Genesis,
        chapter: 1,
        verse: 1,
      })
    );
  });

  it('returns guidance response for seeking keywords', async () => {
    const request: GuideRequest = {
      userInput: 'I need guidance in my life',
    };

    const response = await gateway.sendMessage(request);

    expect(response.citations).toContainEqual(
      expect.objectContaining({
        book: BibleBook.Matthew,
        chapter: 6,
        verse: 33,
      })
    );
  });

  it('returns default response for unrecognized input', async () => {
    const request: GuideRequest = {
      userInput: 'random text',
    };

    const response = await gateway.sendMessage(request);

    expect(response.text).toBeTruthy();
    expect(response.citations.length).toBeGreaterThan(0);
    expect(response.suggestions.length).toBeGreaterThan(0);
  });

  it('includes structured suggestions in responses', async () => {
    const request: GuideRequest = {
      userInput: "I'm anxious",
    };

    const response = await gateway.sendMessage(request);

    expect(response.suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: expect.stringMatching(/^(reflection|question|related_verse)$/),
          text: expect.any(String),
        }),
      ])
    );
  });
});
