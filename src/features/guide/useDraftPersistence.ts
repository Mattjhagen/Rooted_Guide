import { useCallback } from 'react';
import { safeStorage } from '../../infrastructure/storage/safeStorage';

const DRAFT_KEY = '@plumbline_guide_draft';

/**
 * Hook for persisting and restoring draft text
 *
 * Saves draft to safeStorage to preserve across app relaunches
 */
export function useDraftPersistence() {
  const saveDraft = useCallback(async (draft: string) => {
    try {
      if (draft.trim()) {
        await safeStorage.setItem(DRAFT_KEY, draft);
      } else {
        await safeStorage.removeItem(DRAFT_KEY);
      }
    } catch (error) {
      console.warn('Failed to save draft:', error);
    }
  }, []);

  const loadDraft = useCallback(async (): Promise<string | null> => {
    try {
      return await safeStorage.getItem(DRAFT_KEY);
    } catch (error) {
      console.warn('Failed to load draft:', error);
      return null;
    }
  }, []);

  const clearDraft = useCallback(async () => {
    try {
      await safeStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      console.warn('Failed to clear draft:', error);
    }
  }, []);

  return { saveDraft, loadDraft, clearDraft };
}
