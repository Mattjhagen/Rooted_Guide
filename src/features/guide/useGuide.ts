import { useState, useCallback, useReducer, useRef } from 'react';
import { GuideTurn, GuideRequest } from '@/domain/models';
import { GuideGateway } from '@/domain/services';
import { guideReducer, GuideState, canSubmit, canCancel } from './guideStateMachine';

// Maximum number of turns to keep in context (prevents unbounded growth)
const MAX_CONTEXT_TURNS = 50;

interface UseGuideReturn {
  turns: GuideTurn[];
  state: GuideState;
  sendMessage: (userInput: string) => Promise<void>;
  cancelMessage: () => void;
  clear: () => void;
  retry: () => Promise<void>;
}

/**
 * Hook for managing guide conversation state with robust state machine
 *
 * Features:
 * - Prevents duplicate submissions
 * - Supports cancellation of in-flight requests
 * - Prevents stale responses from overwriting current state
 * - Bounds conversation context to prevent unbounded growth
 * - Handles offline and recoverable error states
 */
export function useGuide(gateway: GuideGateway): UseGuideReturn {
  const [turns, setTurns] = useState<GuideTurn[]>([]);
  const [state, dispatch] = useReducer(guideReducer, { type: 'idle' });
  const lastRequestRef = useRef<string | null>(null);
  const lastInputRef = useRef<string | null>(null);

  const sendMessage = useCallback(
    async (userInput: string) => {
      if (!userInput.trim() || !canSubmit(state)) return;

      const requestId = `${Date.now()}-${Math.random()}`;
      lastRequestRef.current = requestId;
      lastInputRef.current = userInput;

      dispatch({ type: 'SUBMIT', requestId, userInput });

      // Add user turn immediately
      const userTurn: GuideTurn = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userInput,
        timestamp: new Date(),
      };

      setTurns((prev) => {
        const updated = [...prev, userTurn];
        // Bound context to prevent unbounded growth
        return updated.length > MAX_CONTEXT_TURNS
          ? updated.slice(updated.length - MAX_CONTEXT_TURNS)
          : updated;
      });

      try {
        // Transition to responding state
        dispatch({ type: 'RESPOND', requestId });

        // Check if request was cancelled before we got here
        if (lastRequestRef.current !== requestId) {
          return;
        }

        // Get bounded context for request
        const contextTurns = turns.slice(-MAX_CONTEXT_TURNS);

        // Send request to gateway
        const request: GuideRequest = {
          userInput,
          context: {
            previousTurns: contextTurns,
          },
        };

        const response = await gateway.sendMessage(request);

        // Check again if request was cancelled or superseded
        if (lastRequestRef.current !== requestId) {
          return;
        }

        // Add guide turn
        const guideTurn: GuideTurn = {
          id: `guide-${Date.now()}`,
          role: 'guide',
          content: response.text,
          citations: response.citations,
          suggestions: response.suggestions,
          timestamp: new Date(),
        };

        setTurns((prev) => {
          const updated = [...prev, guideTurn];
          return updated.length > MAX_CONTEXT_TURNS
            ? updated.slice(updated.length - MAX_CONTEXT_TURNS)
            : updated;
        });

        dispatch({ type: 'COMPLETE' });
      } catch (err) {
        // Check if request was cancelled
        if (lastRequestRef.current !== requestId) {
          return;
        }

        const message = err instanceof Error ? err.message : 'Failed to send message';
        const isOffline =
          message.toLowerCase().includes('network') || message.toLowerCase().includes('offline');

        if (isOffline) {
          dispatch({ type: 'OFFLINE' });
        } else {
          dispatch({ type: 'ERROR', message, recoverable: true });
        }
      }
    },
    [gateway, state, turns]
  );

  const cancelMessage = useCallback(() => {
    if (canCancel(state) && lastRequestRef.current) {
      dispatch({ type: 'CANCEL', requestId: lastRequestRef.current });
      lastRequestRef.current = null;
    }
  }, [state]);

  const retry = useCallback(async () => {
    if (state.type === 'error' && state.recoverable && lastInputRef.current) {
      dispatch({ type: 'RESET' });
      await sendMessage(lastInputRef.current);
    }
  }, [state, sendMessage]);

  const clear = useCallback(() => {
    setTurns([]);
    dispatch({ type: 'RESET' });
    lastRequestRef.current = null;
    lastInputRef.current = null;
  }, []);

  return {
    turns,
    state,
    sendMessage,
    cancelMessage,
    clear,
    retry,
  };
}
