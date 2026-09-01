import React from 'react';
import { DailyPathScreen, LaunchScreen } from '@/ui/screens';
import { useLaunchState } from '@/infrastructure/launch/useLaunchState';

/**
 * Home Tab - Daily Path Entry Point
 *
 * Shows launch screen on cold app start, then the daily path.
 * Launch screen displays verse of the day with calm animation.
 */
export default function HomeTab() {
  const { shouldShowLaunch, dismissLaunch, isReady } = useLaunchState();

  if (!isReady) {
    return null;
  }

  if (shouldShowLaunch) {
    return <LaunchScreen onContinue={dismissLaunch} />;
  }

  return <DailyPathScreen />;
}
