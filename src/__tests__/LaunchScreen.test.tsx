/**
 * LaunchScreen Tests
 *
 * Verifies launch screen display, animation, verse loading, and routing.
 */

import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { LaunchScreen } from '@/ui/screens/LaunchScreen';
import { useBibleRepository } from '@/infrastructure/scripture/useBibleRepository';
import { AccessibilityInfo } from 'react-native';

// Mock dependencies
jest.mock('@/infrastructure/scripture/useBibleRepository');

const mockBibleRepository = {
  getPassage: jest.fn(),
};

describe('LaunchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useBibleRepository as jest.Mock).mockReturnValue(mockBibleRepository);
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  });

  it('renders verse of the day label', async () => {
    mockBibleRepository.getPassage.mockResolvedValue([
      {
        ref: { book: 'John', chapter: 3, verse: 16 },
        text: 'For God so loved the world...',
      },
    ]);

    const { getByText } = render(<LaunchScreen onContinue={jest.fn()} />);

    await waitFor(() => {
      expect(getByText('Verse of the Day')).toBeTruthy();
    });
  });

  it('displays verse reference', async () => {
    mockBibleRepository.getPassage.mockResolvedValue([
      {
        ref: { book: 'Psalms', chapter: 34, verse: 8 },
        text: 'Oh taste and see that Yahweh is good.',
      },
    ]);

    const { getByText } = render(<LaunchScreen onContinue={jest.fn()} />);

    await waitFor(() => {
      // Verse reference should be visible (could be any verse from daily rotation)
      expect(getByText(/Psalms|John|Proverbs|Romans/)).toBeTruthy();
    });
  });

  it('displays verse text from local Bible', async () => {
    const verseText = 'For God so loved the world, that he gave his only born Son.';
    mockBibleRepository.getPassage.mockResolvedValue([
      {
        ref: { book: 'John', chapter: 3, verse: 16 },
        text: verseText,
      },
    ]);

    const { getByText } = render(<LaunchScreen onContinue={jest.fn()} />);

    await waitFor(() => {
      expect(getByText(verseText)).toBeTruthy();
    });
  });

  it('shows Continue button after verse loads', async () => {
    mockBibleRepository.getPassage.mockResolvedValue([
      {
        ref: { book: 'John', chapter: 3, verse: 16 },
        text: 'For God so loved the world...',
      },
    ]);

    const { getByText } = render(<LaunchScreen onContinue={jest.fn()} />);

    await waitFor(
      () => {
        expect(getByText('Continue')).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  it('calls onContinue when button pressed', async () => {
    const onContinue = jest.fn();

    mockBibleRepository.getPassage.mockResolvedValue([
      {
        ref: { book: 'John', chapter: 3, verse: 16 },
        text: 'For God so loved the world...',
      },
    ]);

    const { getByText } = render(<LaunchScreen onContinue={onContinue} />);

    await waitFor(
      () => {
        expect(getByText('Continue')).toBeTruthy();
      },
      { timeout: 3000 }
    );

    fireEvent.press(getByText('Continue'));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('shows fallback verse if loading fails', async () => {
    mockBibleRepository.getPassage.mockRejectedValue(new Error('Failed to load'));

    const { getByText } = render(<LaunchScreen onContinue={jest.fn()} />);

    await waitFor(() => {
      // Should show fallback verse (John 3:16)
      expect(getByText(/For God so loved/)).toBeTruthy();
    });
  });

  it('shows Continue button after 2-second fallback timeout', async () => {
    mockBibleRepository.getPassage.mockResolvedValue([
      {
        ref: { book: 'John', chapter: 3, verse: 16 },
        text: 'For God so loved the world...',
      },
    ]);

    const { getByText } = render(<LaunchScreen onContinue={jest.fn()} />);

    // Continue button should appear within 3 seconds (2s timeout + buffer)
    await waitFor(
      () => {
        expect(getByText('Continue')).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  it('respects reduce motion preference', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);

    mockBibleRepository.getPassage.mockResolvedValue([
      {
        ref: { book: 'John', chapter: 3, verse: 16 },
        text: 'For God so loved the world...',
      },
    ]);

    const { getByText } = render(<LaunchScreen onContinue={jest.fn()} />);

    // With reduce motion, Continue should appear immediately
    await waitFor(
      () => {
        expect(getByText('Continue')).toBeTruthy();
      },
      { timeout: 1000 }
    );
  });

  it('has accessible Continue button', async () => {
    mockBibleRepository.getPassage.mockResolvedValue([
      {
        ref: { book: 'John', chapter: 3, verse: 16 },
        text: 'For God so loved the world...',
      },
    ]);

    const { getByLabelText } = render(<LaunchScreen onContinue={jest.fn()} />);

    await waitFor(
      () => {
        const button = getByLabelText('Continue to app');
        expect(button).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  it('handles verse range correctly', async () => {
    mockBibleRepository.getPassage.mockResolvedValue([
      {
        ref: { book: 'Proverbs', chapter: 3, verse: 5 },
        text: 'Trust in Yahweh with all your heart,',
      },
      {
        ref: { book: 'Proverbs', chapter: 3, verse: 6 },
        text: "and don't lean on your own understanding.",
      },
    ]);

    const { getByText } = render(<LaunchScreen onContinue={jest.fn()} />);

    await waitFor(() => {
      // Should combine multi-verse passages
      const text = getByText(/Trust in Yahweh/);
      expect(text).toBeTruthy();
    });
  });
});
