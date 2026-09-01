import { useState, useEffect, useCallback, useRef } from 'react';
import { useUserDatabase } from '@/infrastructure/persistence/useUserDatabase';
import { ModuleType, getNextModule } from '@/domain/models/DailyPath';
import { DailySession } from '@/domain/repositories';
import { ReflectionKind } from '@/domain/models';
import { TODAYS_PASSAGE } from '@/domain/models/TodaysPassage';
import { getTimeService } from '@/infrastructure/time';

/**
 * Map module type to reflection kind
 */
function getReflectionKind(moduleType: ModuleType): ReflectionKind {
  switch (moduleType) {
    case 'arrive':
      return 'arrive';
    case 'read':
      return 'response';
    case 'reflect':
      return 'reflection';
    case 'respond':
      return 'response';
    case 'close':
      return 'close';
  }
}

/**
 * Hook for managing daily path state and persistence
 */
export function useDailyPath() {
  const { dailyPracticeRepository, reflectionRepository } = useUserDatabase();
  const [session, setSession] = useState<DailySession | null>(null);
  const [currentModule, setCurrentModule] = useState<ModuleType>('arrive');
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [timeUntilUnlock, setTimeUntilUnlock] = useState<number | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unlockCheckRef = useRef<NodeJS.Timeout | null>(null);

  // Check if devotional is locked and calculate time remaining
  const checkLockStatus = useCallback(() => {
    if (!session?.nextDevotionalAvailableAt) {
      setIsLocked(false);
      setTimeUntilUnlock(null);
      return false;
    }

    const now = getTimeService().getCurrentTime();
    const unlockTime = new Date(session.nextDevotionalAvailableAt);
    const msUntilUnlock = unlockTime.getTime() - now.getTime();

    if (msUntilUnlock <= 0) {
      setIsLocked(false);
      setTimeUntilUnlock(null);
      return false;
    } else {
      setIsLocked(true);
      setTimeUntilUnlock(msUntilUnlock);
      return true;
    }
  }, [session?.nextDevotionalAvailableAt]);

  // Load or create today's session
  useEffect(() => {
    async function loadSession() {
      try {
        const timeService = getTimeService();
        const now = timeService.getCurrentTime();
        const today = now.toISOString().split('T')[0];

        let todaySession = await dailyPracticeRepository.getTodaySession();

        if (!todaySession) {
          todaySession = await dailyPracticeRepository.createSession(today);
        }

        setSession(todaySession);

        // Check if locked (12-hour gate from previous completion)
        const locked = todaySession.nextDevotionalAvailableAt
          ? new Date(todaySession.nextDevotionalAvailableAt).getTime() > now.getTime()
          : false;

        // If locked, stay in completion state
        if (locked) {
          setIsLocked(true);
          setLoading(false);
          return;
        }

        // Restore progress
        let targetModule: ModuleType = 'arrive';
        if (todaySession.lastModule) {
          const nextMod = getNextModule(todaySession.lastModule);
          targetModule = nextMod || 'close';
        }
        setCurrentModule(targetModule);

        // Get or create current module record
        const modules = await dailyPracticeRepository.getSessionModules(todaySession.id);
        let moduleRecord = modules.find((m) => m.moduleType === targetModule);

        if (!moduleRecord) {
          // Module not yet created - it will be created when first completing or saving draft
          setCurrentModuleId(null);
        } else {
          setCurrentModuleId(moduleRecord.id);
          // Load existing draft
          const existingDraft = await reflectionRepository.getModuleDraft(moduleRecord.id);
          if (existingDraft) {
            setDraft(existingDraft.content);
          }
        }
      } catch (error) {
        console.error('Failed to load session:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [dailyPracticeRepository, reflectionRepository, checkLockStatus]);

  // Poll for unlock time
  useEffect(() => {
    if (!isLocked || !session?.nextDevotionalAvailableAt) {
      if (unlockCheckRef.current) {
        clearInterval(unlockCheckRef.current);
        unlockCheckRef.current = null;
      }
      return;
    }

    // Update time remaining every minute
    unlockCheckRef.current = setInterval(() => {
      const stillLocked = checkLockStatus();
      if (!stillLocked) {
        // Auto-unlock: reload session
        setIsLocked(false);
        setCurrentModule('arrive');
        setCurrentModuleId(null);
        setDraft('');
      }
    }, 60000); // Check every minute

    // Initial check
    checkLockStatus();

    return () => {
      if (unlockCheckRef.current) {
        clearInterval(unlockCheckRef.current);
      }
    };
    // checkLockStatus is stable from useCallback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocked, session?.nextDevotionalAvailableAt]);

  // Auto-save draft with debounce
  const saveDraft = useCallback(
    async (text: string) => {
      if (!session || !text.trim()) return;

      try {
        // Ensure we have a module record
        let moduleId = currentModuleId;
        if (!moduleId) {
          await dailyPracticeRepository.completeModule(session.id, currentModule);

          const modules = await dailyPracticeRepository.getSessionModules(session.id);
          const moduleRecord = modules.find((m) => m.moduleType === currentModule);
          if (!moduleRecord) return;

          moduleId = moduleRecord.id;
          setCurrentModuleId(moduleId);
        }

        const kind = getReflectionKind(currentModule);
        await reflectionRepository.saveDraft(moduleId, kind, text, TODAYS_PASSAGE.ref);
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    },
    [session, currentModuleId, currentModule, dailyPracticeRepository, reflectionRepository]
  );

  // Update draft with auto-save
  const updateDraft = useCallback(
    (text: string) => {
      setDraft(text);

      // Debounce auto-save (1 second)
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveDraft(text);
      }, 1000);
    },
    [saveDraft]
  );

  // Save response and advance
  const completeModule = useCallback(
    async (moduleType: ModuleType, response: string) => {
      if (!session) return;

      try {
        // Clear any pending auto-save
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        // Ensure module exists and get ID
        let moduleId = currentModuleId;
        if (!moduleId) {
          await dailyPracticeRepository.completeModule(session.id, moduleType);
          const modules = await dailyPracticeRepository.getSessionModules(session.id);
          const moduleRecord = modules.find((m) => m.moduleType === moduleType);
          moduleId = moduleRecord?.id || null;
        }

        // Save final response
        if (response.trim() && moduleId) {
          const kind = getReflectionKind(moduleType);
          await reflectionRepository.saveResponse(moduleId, kind, response, TODAYS_PASSAGE.ref);
        }

        // Mark module complete (if not already)
        if (!currentModuleId) {
          await dailyPracticeRepository.completeModule(session.id, moduleType);
        }

        // Move to next module or complete
        const next = getNextModule(moduleType);
        if (next) {
          setCurrentModule(next);
          setCurrentModuleId(null);
          setDraft('');

          // Try to load draft for next module
          const modules = await dailyPracticeRepository.getSessionModules(session.id);
          const nextModuleRecord = modules.find((m) => m.moduleType === next);
          if (nextModuleRecord) {
            setCurrentModuleId(nextModuleRecord.id);
            const existingDraft = await reflectionRepository.getModuleDraft(nextModuleRecord.id);
            if (existingDraft) {
              setDraft(existingDraft.content);
            }
          }
        } else {
          // Path complete - set 12-hour gate
          const now = getTimeService().getCurrentTime();
          const twelveHoursLater = new Date(now.getTime() + 12 * 60 * 60 * 1000);

          await dailyPracticeRepository.updateSession(session.id, {
            completedAt: now,
            nextDevotionalAvailableAt: twelveHoursLater,
          });
          const updatedSession = await dailyPracticeRepository.getSession(session.id);
          setSession(updatedSession);
          setIsLocked(true);
          checkLockStatus();
        }
      } catch (error) {
        console.error('Failed to complete module:', error);
      }
    },
    [session, currentModuleId, dailyPracticeRepository, reflectionRepository, checkLockStatus]
  );

  const isComplete = session?.completedAt !== undefined;

  // Start from beginning (for "start fresh" action)
  const startFromBeginning = useCallback(() => {
    setCurrentModule('arrive');
    setCurrentModuleId(null);
    setDraft('');
  }, []);

  return {
    session,
    currentModule,
    draft,
    updateDraft,
    loading,
    completeModule,
    isComplete,
    isLocked,
    timeUntilUnlock,
    startFromBeginning,
  };
}
