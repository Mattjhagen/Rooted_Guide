import { SafetyRouter } from '../domain/services/SafetyRouter';

describe('SafetyRouter', () => {
  let router: SafetyRouter;

  beforeEach(() => {
    router = new SafetyRouter();
  });

  describe('getSafetyMessage', () => {
    it('returns null for safe category', () => {
      const message = router.getSafetyMessage('safe');
      expect(message).toBeNull();
    });

    it('returns crisis message with resources for crisis category', () => {
      const message = router.getSafetyMessage('crisis');

      expect(message).not.toBeNull();
      expect(message?.category).toBe('crisis');
      expect(message?.message).toContain('immediate');
      expect(message?.resources).toBeDefined();
      expect(message?.resources?.contacts).toContainEqual(
        expect.objectContaining({
          name: '988 Suicide & Crisis Lifeline',
        })
      );
      expect(message?.allowContinue).toBe(true); // Respects user autonomy
    });

    it('returns support message for needs_support category', () => {
      const message = router.getSafetyMessage('needs_support');

      expect(message).not.toBeNull();
      expect(message?.category).toBe('needs_support');
      expect(message?.message).toContain('counselor');
      expect(message?.resources).toBeDefined();
      expect(message?.allowContinue).toBe(true);
    });

    it('returns off-topic message for off_topic category', () => {
      const message = router.getSafetyMessage('off_topic');

      expect(message).not.toBeNull();
      expect(message?.category).toBe('off_topic');
      expect(message?.message).toContain('Scripture');
      expect(message?.allowContinue).toBe(true);
    });
  });

  describe('shouldShowImmediately', () => {
    it('shows crisis messages immediately', () => {
      expect(router.shouldShowImmediately('crisis')).toBe(true);
    });

    it('does not show safe messages immediately', () => {
      expect(router.shouldShowImmediately('safe')).toBe(false);
    });

    it('does not show support messages immediately', () => {
      expect(router.shouldShowImmediately('needs_support')).toBe(false);
    });
  });

  describe('shouldShowSupplementary', () => {
    it('shows support messages as supplementary', () => {
      expect(router.shouldShowSupplementary('needs_support')).toBe(true);
    });

    it('does not show crisis as supplementary', () => {
      expect(router.shouldShowSupplementary('crisis')).toBe(false);
    });

    it('does not show safe as supplementary', () => {
      expect(router.shouldShowSupplementary('safe')).toBe(false);
    });
  });

  describe('crisis message quality', () => {
    it('is compassionate and non-blocking', () => {
      const message = router.getSafetyMessage('crisis');

      expect(message?.message).not.toContain('must');
      expect(message?.message).not.toContain('required');
      expect(message?.message).not.toContain('blocked');
      expect(message?.allowContinue).toBe(true);
    });

    it('provides 24/7 resources', () => {
      const message = router.getSafetyMessage('crisis');

      const has24x7 = message?.resources?.contacts.some((c) => c.availability.includes('24/7'));
      expect(has24x7).toBe(true);
    });

    it('includes emergency services', () => {
      const message = router.getSafetyMessage('crisis');

      const hasEmergency = message?.resources?.contacts.some((c) => c.phone === '911');
      expect(hasEmergency).toBe(true);
    });
  });

  describe('support message quality', () => {
    it('is non-shaming and empowering', () => {
      const message = router.getSafetyMessage('needs_support');

      expect(message?.message).not.toContain('wrong');
      expect(message?.message).not.toContain('should');
      expect(message?.message).not.toContain('must');
      expect(message?.message).toContain('benefit');
    });
  });

  describe('off-topic message quality', () => {
    it('gently redirects without blocking', () => {
      const message = router.getSafetyMessage('off_topic');

      expect(message?.message).not.toContain('cannot');
      expect(message?.message).not.toContain('not allowed');
      expect(message?.message).toContain('ready');
      expect(message?.allowContinue).toBe(true);
    });
  });
});
