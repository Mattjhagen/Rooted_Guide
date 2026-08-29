/**
 * Tests that verify the daily Scripture path remains fully usable
 * when the guide service is unavailable
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { ServiceUnavailable } from '../ui/components/ServiceUnavailable';
import { getGuideConfig } from '../infrastructure/config/guideConfig';

describe('Guide service unavailability', () => {
  describe('ServiceUnavailable component', () => {
    it('renders gentle unavailable message', () => {
      const { getByText } = render(<ServiceUnavailable />);

      const message = getByText(/temporarily unavailable/i);
      expect(message).toBeTruthy();
    });

    it('confirms Scripture path remains available', () => {
      const { getByText } = render(<ServiceUnavailable />);

      const message = getByText(/explore Scripture directly/i);
      expect(message).toBeTruthy();
    });

    it('is non-blocking and non-shaming', () => {
      const { queryByText } = render(<ServiceUnavailable />);

      // Should not contain blocking language
      expect(queryByText(/blocked/i)).toBeNull();
      expect(queryByText(/cannot/i)).toBeNull();
      expect(queryByText(/must/i)).toBeNull();
      expect(queryByText(/error/i)).toBeNull();
    });

    it('supports custom message', () => {
      const { getByText } = render(<ServiceUnavailable message="Custom unavailable message" />);

      expect(getByText('Custom unavailable message')).toBeTruthy();
    });
  });

  describe('configuration behavior', () => {
    const originalEnv = process.env;
    const originalDev = (global as any).__DEV__;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
      (global as any).__DEV__ = originalDev;
    });

    afterAll(() => {
      process.env = originalEnv;
      (global as any).__DEV__ = originalDev;
    });

    it('uses local dev mock in development without API URL', () => {
      // @ts-ignore - Setting __DEV__ for test
      global.__DEV__ = true;
      delete process.env.EXPO_PUBLIC_GUIDE_API_URL;

      const config = getGuideConfig();

      expect(config.isAvailable).toBe(true);
      expect(config.useLocalDevMock).toBe(true);
    });

    it('is unavailable in production without API URL', () => {
      // @ts-ignore
      global.__DEV__ = false;
      delete process.env.EXPO_PUBLIC_GUIDE_API_URL;

      const config = getGuideConfig();

      expect(config.isAvailable).toBe(false);
      expect(config.unavailableReason).toBeDefined();
    });

    it('uses HTTP gateway when API URL is configured', () => {
      // @ts-ignore
      global.__DEV__ = false;
      process.env.EXPO_PUBLIC_GUIDE_API_URL = 'https://api.example.com/v1';

      // Re-import after setting env vars
      jest.resetModules();
      const {
        getGuideConfig: freshGetGuideConfig,
      } = require('../infrastructure/config/guideConfig');

      const config = freshGetGuideConfig();

      expect(config.isAvailable).toBe(true);
      expect(config.useLocalDevMock).toBe(false);
      expect(config.apiBaseUrl).toBe('https://api.example.com/v1');
    });
  });

  describe('security: no provider secrets in environment', () => {
    it('does not accept provider API keys in environment', () => {
      // Verify that our config only reads EXPO_PUBLIC_GUIDE_API_URL
      // and never looks for provider-specific keys
      const config = getGuideConfig();

      // Config should never have these fields
      expect(config).not.toHaveProperty('openaiKey');
      expect(config).not.toHaveProperty('anthropicKey');
      expect(config).not.toHaveProperty('geminiKey');

      // Environment should never set these (this is a documentation test)
      expect(process.env).not.toHaveProperty('EXPO_PUBLIC_OPENAI_API_KEY');
      expect(process.env).not.toHaveProperty('EXPO_PUBLIC_ANTHROPIC_API_KEY');
      expect(process.env).not.toHaveProperty('EXPO_PUBLIC_GEMINI_API_KEY');
    });
  });
});
