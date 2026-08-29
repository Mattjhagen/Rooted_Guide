import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_KEY = '@plumbline_guide_draft';

/**
 * Hook for persisting and restoring draft text
 *
 * Saves draft to AsyncStorage to preserve across app relaunches
 */
export function useDraftPersistence() {
  const saveDraft = useCallback(async (draft: string) => {
    try {
      if (draft.trim()) {
        await AsyncStorage.setItem(DRAFT_KEY, draft);
      } else {
        await AsyncStorage.removeItem(DRAFT_KEY);
      }
    } catch (error) {
      console.warn('Failed to save draft:', error);
    }
  }, []);

  const loadDraft = useCallback(async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(DRAFT_KEY);
    } catch (error) {
      console.warn('Failed to load draft:', error);
      return null;
    }
  }, []);

  const clearDraft = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      console.warn('Failed to clear draft:', error);
    }
  }, []);

  return { saveDraft, loadDraft, clearDraft };
}
