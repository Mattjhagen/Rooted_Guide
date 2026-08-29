import { MockGuideGateway } from '../infrastructure/adapters/MockGuideGateway';
import { GuideRequest } from '../domain/models';
import { BibleBook } from '../domain/models/BibleBook';

describe('MockGuideGateway', () => {
  let gateway: MockGuideGateway;

  beforeEach(() => {
    gateway = new MockGuideGateway();
  });

  describe('conversational progression', () => {
    it('first exchange: asks brief follow-up question without citations', async () => {
      const request: GuideRequest = {
        userInput: "I'm feeling anxious",
        context: { previousTurns: [] },
      };

      const response = await gateway.sendMessage(request);

      expect(response.text).toBeTruthy();
      expect(response.text.length).toBeLessThan(150);
      expect(response.citations).toHaveLength(0);
      expect(response.suggestions).toHaveLength(0);
    });

    it('second exchange: transitions to Scripture path', async () => {
      const request: GuideRequest = {
        userInput: "I'm worried about work",
        context: {
          previousTurns: [
            {
              id: '1',
              role: 'user',
              content: "I'm anxious",
              timestamp: new Date(),
            },
            {
              id: '2',
              role: 'guide',
              content: 'What is sitting with you?',
              timestamp: new Date(),
            },
          ],
        },
      };

      const response = await gateway.sendMessage(request);

      expect(response.text).toContain('passage');
      expect(response.citations).toHaveLength(0);
      expect(response.suggestions).toHaveLength(0);
    });

    it('third exchange: presents Verse of the Day with citations', async () => {
      const request: GuideRequest = {
        userInput: 'Yes',
        context: {
          previousTurns: [
            { id: '1', role: 'user', content: "I'm anxious", timestamp: new Date() },
            { id: '2', role: 'guide', content: 'What is sitting?', timestamp: new Date() },
            { id: '3', role: 'user', content: 'Work stress', timestamp: new Date() },
            { id: '4', role: 'guide', content: 'Ready for passage?', timestamp: new Date() },
          ],
        },
      };

      const response = await gateway.sendMessage(request);

      expect(response.text).toBeTruthy();
      expect(response.citations.length).toBeGreaterThan(0);
      expect(response.citations[0].book).toBe(BibleBook.Psalms);
    });

    it('includes optional continue suggestion in Scripture path', async () => {
      const request: GuideRequest = {
        userInput: 'Ready',
        context: {
          previousTurns: [
            { id: '1', role: 'user', content: 'Start', timestamp: new Date() },
            { id: '2', role: 'guide', content: 'How are you?', timestamp: new Date() },
            { id: '3', role: 'user', content: 'Tired', timestamp: new Date() },
            { id: '4', role: 'guide', content: 'Passage?', timestamp: new Date() },
          ],
        },
      };

      const response = await gateway.sendMessage(request);

      expect(response.suggestions).toHaveLength(1);
      expect(response.suggestions[0].text).toContain('Continue');
    });
  });

  describe('keyword recognition', () => {
    it('responds to anxiety keywords in first exchange', async () => {
      const request: GuideRequest = {
        userInput: "I'm feeling anxious",
      };

      const response = await gateway.sendMessage(request);

      expect(response.text.toLowerCase()).toContain('hear');
    });

    it('responds to gratitude keywords in first exchange', async () => {
      const request: GuideRequest = {
        userInput: "I'm grateful today",
      };

      const response = await gateway.sendMessage(request);

      expect(response.text.toLowerCase()).toMatch(/gift|noticing|good/);
    });
  });
});
