import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { IntakeQuestionnaireScreen } from '@/ui/screens/IntakeQuestionnaireScreen';
import { ThemeProvider } from '@/features/preferences/ThemeContext';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

describe('IntakeQuestionnaireScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders initial conversational name step', () => {
    const { getByPlaceholderText } = render(
      <ThemeProvider>
        <IntakeQuestionnaireScreen onComplete={jest.fn()} />
      </ThemeProvider>
    );

    expect(getByPlaceholderText('Enter your name...')).toBeTruthy();
  });

  it('submits name and displays greeting', () => {
    const { getByPlaceholderText, getByLabelText, getByText } = render(
      <ThemeProvider>
        <IntakeQuestionnaireScreen onComplete={jest.fn()} />
      </ThemeProvider>
    );

    const input = getByPlaceholderText('Enter your name...');
    fireEvent.changeText(input, 'Matthew');

    const submitBtn = getByLabelText('Submit name');
    fireEvent.press(submitBtn);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(getByText(/Peace be with you, Matthew!/)).toBeTruthy();
  });
});
