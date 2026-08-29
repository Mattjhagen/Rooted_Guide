import { useState, useCallback } from 'react';
import { GuideTurn, GuideRequest } from '@/domain/models';
import { GuideGateway } from '@/domain/services';

interface UseGuideReturn {
  turns: GuideTurn[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (userInput: string) => Promise<void>;
  clear: () => void;
}

/**
 * Hook for managing guide conversation state
 */
export function useGuide(gateway: GuideGateway): UseGuideReturn {
  const [turns, setTurns] = useState<GuideTurn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (userInput: string) => {
      if (!userInput.trim()) return;

      setIsLoading(true);
      setError(null);

      // Add user turn immediately
      const userTurn: GuideTurn = {
        id: Date.now().toString(),
        role: 'user',
        content: userInput,
        timestamp: new Date(),
      };

      setTurns((prev) => [...prev, userTurn]);

      try {
        // Send request to gateway
        const request: GuideRequest = {
          userInput,
          context: {
            previousTurns: turns,
          },
        };

        const response = await gateway.sendMessage(request);

        // Add guide turn
        const guideTurn: GuideTurn = {
          id: (Date.now() + 1).toString(),
          role: 'guide',
          content: response.text,
          citations: response.citations,
          suggestions: response.suggestions,
          timestamp: new Date(),
        };

        setTurns((prev) => [...prev, guideTurn]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
      } finally {
        setIsLoading(false);
      }
    },
    [gateway, turns]
  );

  const clear = useCallback(() => {
    setTurns([]);
    setError(null);
  }, []);

  return {
    turns,
    isLoading,
    error,
    sendMessage,
    clear,
  };
}
