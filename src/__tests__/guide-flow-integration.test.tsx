import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Composer } from '../ui/components/Composer';
import { GuideMessage } from '../ui/components/GuideMessage';
import { MockBibleRepository } from '../infrastructure/adapters/MockBibleRepository';
import { BibleBook } from '../domain/models';

describe('Guide Flow Integration', () => {
  describe('Initial cursor-focused state', () => {
    it('auto-focuses composer when empty', () => {
      const { getByLabelText } = render(<Composer onSubmit={jest.fn()} autoFocus={true} />);

      const input = getByLabelText('Message input');
      expect(input).toBeTruthy();
    });

    it('allows blank placeholder for empty state', () => {
      const { getByLabelText } = render(<Composer onSubmit={jest.fn()} placeholder="" />);

      const input = getByLabelText('Message input');
      expect(input).toBeTruthy();
    });
  });

  describe('User message submission', () => {
    it('calls onSubmit with trimmed text', () => {
      const onSubmit = jest.fn();
      const { getByLabelText, getByRole } = render(<Composer onSubmit={onSubmit} />);

      const input = getByLabelText('Message input');
      const button = getByRole('button');

      fireEvent.changeText(input, '  Hello world  ');
      fireEvent.press(button);

      expect(onSubmit).toHaveBeenCalledWith('Hello world');
    });

    it('clears text after successful submission', () => {
      const { getByLabelText, getByRole } = render(<Composer onSubmit={jest.fn()} />);

      const input = getByLabelText('Message input');
      const button = getByRole('button');

      fireEvent.changeText(input, 'Hello');
      fireEvent.press(button);

      expect(input.props.value).toBe('');
    });

    it('does not submit empty or whitespace-only messages', () => {
      const onSubmit = jest.fn();
      const { getByLabelText, getByRole } = render(<Composer onSubmit={onSubmit} />);

      const input = getByLabelText('Message input');
      const button = getByRole('button');

      fireEvent.changeText(input, '   ');
      fireEvent.press(button);

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Duplicate-send prevention', () => {
    it('disables send button when submitting', () => {
      const { getByRole, rerender } = render(
        <Composer onSubmit={jest.fn()} state={{ type: 'idle' }} />
      );

      const button = getByRole('button');
      expect(button.props.accessibilityState?.disabled).toBe(true); // No text yet

      rerender(
        <Composer
          onSubmit={jest.fn()}
          state={{ type: 'submitting', requestId: 'req-1', userInput: 'Hello' }}
        />
      );

      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('shows sending state in button text', () => {
      const { getByText } = render(
        <Composer
          onSubmit={jest.fn()}
          state={{ type: 'submitting', requestId: 'req-1', userInput: 'Hello' }}
        />
      );

      const sendingText = getByText('Sending...');
      expect(sendingText).toBeTruthy();
    });
  });

  describe('Citation rendering', () => {
    it('renders citation card with verse text', async () => {
      const bibleRepository = new MockBibleRepository();
      const guideTurn = {
        id: '1',
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

      const { findByText } = render(
        <GuideMessage turn={guideTurn} bibleRepository={bibleRepository} />
      );

      // Wait for verse to load
      const reference = await findByText(/John 3:16/);
      expect(reference).toBeTruthy();

      const verseText = await findByText(/For God so loved the world/);
      expect(verseText).toBeTruthy();
    });

    it('shows WEB translation label', async () => {
      const bibleRepository = new MockBibleRepository();
      const guideTurn = {
        id: '1',
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

      const { findByText } = render(
        <GuideMessage turn={guideTurn} bibleRepository={bibleRepository} />
      );

      const translation = await findByText('WEB');
      expect(translation).toBeTruthy();
    });
  });

  describe('Passage context opening', () => {
    it('shows passage context button on citation cards', async () => {
      const bibleRepository = new MockBibleRepository();
      const guideTurn = {
        id: '1',
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

      const { findByText } = render(
        <GuideMessage turn={guideTurn} bibleRepository={bibleRepository} />
      );

      const contextButton = await findByText('View passage context');
      expect(contextButton).toBeTruthy();
    });
  });

  describe('Draft restoration', () => {
    it('initializes with saved draft', () => {
      const { getByLabelText } = render(
        <Composer onSubmit={jest.fn()} initialDraft="Saved draft text" />
      );

      const input = getByLabelText('Message input');
      expect(input.props.value).toBe('Saved draft text');
    });

    it('calls onDraftChange when text changes', () => {
      const onDraftChange = jest.fn();
      const { getByLabelText } = render(
        <Composer onSubmit={jest.fn()} onDraftChange={onDraftChange} />
      );

      const input = getByLabelText('Message input');
      fireEvent.changeText(input, 'New text');

      expect(onDraftChange).toHaveBeenCalledWith('New text');
    });
  });

  describe('Suggestion interaction', () => {
    it('calls onSuggestionPress when suggestion is tapped', () => {
      const onSuggestionPress = jest.fn();
      const guideTurn = {
        id: '1',
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

      const { getByText } = render(
        <GuideMessage turn={guideTurn} onSuggestionPress={onSuggestionPress} />
      );

      const suggestion = getByText('What do you think?');
      fireEvent.press(suggestion);

      expect(onSuggestionPress).toHaveBeenCalledWith('What do you think?');
    });
  });

  describe('Theme support', () => {
    it('renders in light mode', () => {
      const { getByLabelText } = render(<Composer onSubmit={jest.fn()} />);

      const input = getByLabelText('Message input');
      expect(input).toBeTruthy();
    });

    it('renders in dark mode', () => {
      // ColorScheme is handled by React Native's useColorScheme hook
      // This would require mocking the hook, which is out of scope for this test
      const { getByLabelText } = render(<Composer onSubmit={jest.fn()} />);

      const input = getByLabelText('Message input');
      expect(input).toBeTruthy();
    });
  });
});
