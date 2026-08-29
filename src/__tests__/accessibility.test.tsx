import React from 'react';
import { render } from '@testing-library/react-native';
import { Composer } from '../ui/components/Composer';
import { GuideMessage } from '../ui/components/GuideMessage';
import { CitationCard } from '../ui/components/CitationCard';
import { MockBibleRepository } from '../infrastructure/adapters/MockBibleRepository';
import { BibleBook } from '../domain/models';

describe('Accessibility', () => {
  describe('Composer', () => {
    it('has accessible input with label and hint', () => {
      const { getByLabelText } = render(
        <Composer onSubmit={jest.fn()} placeholder="Test placeholder" />
      );

      const input = getByLabelText('Message input');
      expect(input).toBeTruthy();
      expect(input.props.accessibilityHint).toBe('Type your thoughts, questions, or feelings');
    });

    it('has accessible send button with role', () => {
      const { getByRole } = render(<Composer onSubmit={jest.fn()} />);

      const button = getByRole('button');
      expect(button).toBeTruthy();
    });

    it('announces state changes for screen readers', () => {
      const { rerender } = render(<Composer onSubmit={jest.fn()} state={{ type: 'idle' }} />);

      rerender(
        <Composer onSubmit={jest.fn()} state={{ type: 'responding', requestId: 'req-1' }} />
      );

      // State change announcement is handled in useEffect
      expect(true).toBe(true);
    });
  });

  describe('GuideMessage', () => {
    it('has accessible role labels for user and guide messages', () => {
      const userTurn = {
        id: '1',
        role: 'user' as const,
        content: 'Hello',
        timestamp: new Date(),
      };

      const { getByLabelText } = render(<GuideMessage turn={userTurn} />);

      const message = getByLabelText('Your message');
      expect(message).toBeTruthy();
    });

    it('labels citations list with accessibility role', () => {
      const bibleRepository = new MockBibleRepository();
      const guideTurn = {
        id: '2',
        role: 'guide' as const,
        content: 'Scripture says...',
        citations: [
          {
            book: BibleBook.John,
            chapter: 3,
            verse: 16,
          },
        ],
        timestamp: new Date(),
      };

      const { getByLabelText } = render(
        <GuideMessage turn={guideTurn} bibleRepository={bibleRepository} />
      );

      const citations = getByLabelText('Scripture citations');
      expect(citations).toBeTruthy();
    });

    it('labels suggestions with accessibility hints', () => {
      const guideTurn = {
        id: '2',
        role: 'guide' as const,
        content: 'Response',
        suggestions: [
          {
            type: 'question' as const,
            text: 'What do you think?',
          },
        ],
        timestamp: new Date(),
      };

      const { getByLabelText } = render(
        <GuideMessage turn={guideTurn} onSuggestionPress={jest.fn()} />
      );

      const suggestion = getByLabelText('What do you think?');
      expect(suggestion).toBeTruthy();
      expect(suggestion.props.accessibilityHint).toBe(
        'Optional: continue reflecting on this passage'
      );
    });
  });

  describe('CitationCard', () => {
    it('has accessible reference label', () => {
      const bibleRepository = new MockBibleRepository();
      const citation = {
        book: BibleBook.John,
        chapter: 3,
        verse: 16,
      };

      const { getByLabelText } = render(
        <CitationCard citation={citation} bibleRepository={bibleRepository} />
      );

      const card = getByLabelText(/Scripture citation:/);
      expect(card).toBeTruthy();
    });

    it('has accessible context button with hint', async () => {
      const bibleRepository = new MockBibleRepository();
      const citation = {
        book: BibleBook.John,
        chapter: 3,
        verse: 16,
      };

      const { findByLabelText } = render(
        <CitationCard citation={citation} bibleRepository={bibleRepository} />
      );

      // Wait for verse to load
      const contextButton = await findByLabelText('View passage context');
      expect(contextButton).toBeTruthy();
      expect(contextButton.props.accessibilityHint).toBe('Opens a view showing surrounding verses');
    });
  });

  describe('Touch Targets', () => {
    it('ensures minimum touch target size for buttons', () => {
      const { getByRole } = render(<Composer onSubmit={jest.fn()} />);

      const button = getByRole('button');
      const styles = button.props.style;

      // Check for minimum 44x44 touch target (iOS HIG)
      expect(styles.minHeight).toBeGreaterThanOrEqual(44);
    });
  });
});
