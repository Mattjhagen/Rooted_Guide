/**
 * Launch State Tests
 *
 * Verifies cold launch detection and state management.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { useLaunchState, resetLaunchState } from '@/infrastructure/launch/useLaunchState';

// Test component that uses the hook
function TestComponent({
  onRender,
}: {
  onRender: (state: ReturnType<typeof useLaunchState>) => void;
}) {
  const state = useLaunchState();

  React.useEffect(() => {
    onRender(state);
  }, [state, onRender]);

  const text = state.shouldShowLaunch ? 'show' : 'hide';
  const ready = state.isReady ? 'ready' : 'loading';

  return <Text>{`${text}-${ready}`}</Text>;
}

describe('useLaunchState', () => {
  beforeEach(() => {
    resetLaunchState();
  });

  it('shows launch screen on first cold launch', () => {
    let captured: ReturnType<typeof useLaunchState> | null = null;

    render(
      <TestComponent
        onRender={(state) => {
          captured = state;
        }}
      />
    );

    expect(captured).not.toBeNull();
    expect(captured!.shouldShowLaunch).toBe(true);
    expect(captured!.isReady).toBe(true);
  });

  it('dismisses launch screen when dismissed', () => {
    let captured: ReturnType<typeof useLaunchState> | null = null;

    const { rerender } = render(
      <TestComponent
        onRender={(state) => {
          captured = state;
        }}
      />
    );

    const firstCapture = captured!;
    firstCapture.dismissLaunch();

    // Force re-render
    rerender(
      <TestComponent
        onRender={(state) => {
          captured = state;
        }}
      />
    );

    expect(captured!.shouldShowLaunch).toBe(false);
  });

  it('does not show launch screen on subsequent renders', () => {
    let firstCapture: ReturnType<typeof useLaunchState> | null = null;

    const { unmount } = render(
      <TestComponent
        onRender={(state) => {
          firstCapture = state;
        }}
      />
    );

    firstCapture!.dismissLaunch();
    unmount();

    // Second render (simulating navigation or re-render)
    let secondCapture: ReturnType<typeof useLaunchState> | null = null;
    render(
      <TestComponent
        onRender={(state) => {
          secondCapture = state;
        }}
      />
    );

    expect(secondCapture!.shouldShowLaunch).toBe(false);
  });

  it('resets state for testing', () => {
    let firstCapture: ReturnType<typeof useLaunchState> | null = null;

    const { unmount } = render(
      <TestComponent
        onRender={(state) => {
          firstCapture = state;
        }}
      />
    );

    firstCapture!.dismissLaunch();
    unmount();

    // Reset for testing
    resetLaunchState();

    let secondCapture: ReturnType<typeof useLaunchState> | null = null;
    render(
      <TestComponent
        onRender={(state) => {
          secondCapture = state;
        }}
      />
    );

    expect(secondCapture!.shouldShowLaunch).toBe(true);
  });
});
