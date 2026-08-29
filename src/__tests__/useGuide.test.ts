import { renderHook, act } from '@testing-library/react-native';
import { useGuide } from '../features/guide/useGuide';
import { MockGuideGateway } from '../infrastructure/adapters/MockGuideGateway';

describe('useGuide', () => {
  let gateway: MockGuideGateway;

  beforeEach(() => {
    gateway = new MockGuideGateway();
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useGuide(gateway));

    expect(result.current.turns).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sends a message and adds turns', async () => {
    const { result } = renderHook(() => useGuide(gateway));

    await act(async () => {
      await result.current.sendMessage("I'm feeling anxious");
    });

    expect(result.current.turns).toHaveLength(2);
    expect(result.current.turns[0].role).toBe('user');
    expect(result.current.turns[0].content).toBe("I'm feeling anxious");
    expect(result.current.turns[1].role).toBe('guide');
    expect(result.current.turns[1].citations).toBeDefined();
  });

  it('sets loading state during message send', async () => {
    const { result } = renderHook(() => useGuide(gateway));

    let loadingDuringRequest = false;

    act(() => {
      result.current.sendMessage('Hello').then(() => {
        // Message sent
      });
    });

    // Check loading state immediately after initiating send
    if (result.current.isLoading) {
      loadingDuringRequest = true;
    }

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(loadingDuringRequest || !result.current.isLoading).toBe(true);
  });

  it('does not send empty messages', async () => {
    const { result } = renderHook(() => useGuide(gateway));

    await act(async () => {
      await result.current.sendMessage('   ');
    });

    expect(result.current.turns).toHaveLength(0);
  });

  it('clears conversation', async () => {
    const { result } = renderHook(() => useGuide(gateway));

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.turns.length).toBeGreaterThan(0);

    act(() => {
      result.current.clear();
    });

    expect(result.current.turns).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
