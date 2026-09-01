import { useEffect, useState } from 'react';

/**
 * Track launch screen display state
 *
 * Shows launch screen once per cold app launch (when app process starts).
 * State is held in memory only - not persisted to storage.
 */

// In-memory flag shared across all instances
let hasShownLaunchScreen = false;

export function useLaunchState() {
  const [shouldShowLaunch, setShouldShowLaunch] = useState(() => !hasShownLaunchScreen);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if we should show launch screen
    if (!hasShownLaunchScreen) {
      setShouldShowLaunch(true);
    }
    setIsReady(true);
  }, []);

  const dismissLaunch = () => {
    hasShownLaunchScreen = true;
    setShouldShowLaunch(false);
  };

  return {
    shouldShowLaunch,
    dismissLaunch,
    isReady,
  };
}

/**
 * Reset launch state (for testing)
 */
export function resetLaunchState() {
  hasShownLaunchScreen = false;
}
