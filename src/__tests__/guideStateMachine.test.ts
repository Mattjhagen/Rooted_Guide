import { guideReducer, canSubmit, canCancel, getDraft } from '../features/guide/guideStateMachine';

describe('guideStateMachine', () => {
  describe('guideReducer', () => {
    it('starts in idle state', () => {
      const state = { type: 'idle' as const };
      expect(state.type).toBe('idle');
    });

    it('transitions from idle to composing when draft is updated', () => {
      const state = { type: 'idle' as const };
      const nextState = guideReducer(state, {
        type: 'UPDATE_DRAFT',
        draft: 'Hello',
      });
      expect(nextState.type).toBe('composing');
      expect(nextState.type === 'composing' && nextState.draft).toBe('Hello');
    });

    it('transitions from composing to submitting', () => {
      const state = { type: 'composing' as const, draft: 'Hello' };
      const nextState = guideReducer(state, {
        type: 'SUBMIT',
        requestId: 'req-1',
        userInput: 'Hello',
      });
      expect(nextState.type).toBe('submitting');
      expect(nextState.type === 'submitting' && nextState.requestId).toBe('req-1');
    });

    it('prevents duplicate submissions when already submitting', () => {
      const state = { type: 'submitting' as const, requestId: 'req-1', userInput: 'Hello' };
      const nextState = guideReducer(state, {
        type: 'SUBMIT',
        requestId: 'req-2',
        userInput: 'World',
      });
      // Should remain in submitting with original request
      expect(nextState).toEqual(state);
    });

    it('transitions from submitting to responding', () => {
      const state = { type: 'submitting' as const, requestId: 'req-1', userInput: 'Hello' };
      const nextState = guideReducer(state, {
        type: 'RESPOND',
        requestId: 'req-1',
      });
      expect(nextState.type).toBe('responding');
    });

    it('ignores responses for stale requests', () => {
      const state = { type: 'submitting' as const, requestId: 'req-1', userInput: 'Hello' };
      const nextState = guideReducer(state, {
        type: 'RESPOND',
        requestId: 'req-2', // Different request ID
      });
      expect(nextState).toEqual(state);
    });

    it('transitions from responding to completed', () => {
      const state = { type: 'responding' as const, requestId: 'req-1' };
      const nextState = guideReducer(state, { type: 'COMPLETE' });
      expect(nextState.type).toBe('completed');
    });

    it('transitions to cancelled when request is cancelled', () => {
      const state = { type: 'submitting' as const, requestId: 'req-1', userInput: 'Hello' };
      const nextState = guideReducer(state, {
        type: 'CANCEL',
        requestId: 'req-1',
      });
      expect(nextState.type).toBe('cancelled');
    });

    it('transitions to offline state', () => {
      const state = { type: 'submitting' as const, requestId: 'req-1', userInput: 'Hello' };
      const nextState = guideReducer(state, { type: 'OFFLINE' });
      expect(nextState.type).toBe('offline');
    });

    it('transitions to error state with message', () => {
      const state = { type: 'submitting' as const, requestId: 'req-1', userInput: 'Hello' };
      const nextState = guideReducer(state, {
        type: 'ERROR',
        message: 'Network error',
        recoverable: true,
      });
      expect(nextState.type).toBe('error');
      expect(nextState.type === 'error' && nextState.message).toBe('Network error');
      expect(nextState.type === 'error' && nextState.recoverable).toBe(true);
    });

    it('resets to idle state', () => {
      const state = { type: 'error' as const, message: 'Error', recoverable: true };
      const nextState = guideReducer(state, { type: 'RESET' });
      expect(nextState.type).toBe('idle');
    });
  });

  describe('canSubmit', () => {
    it('allows submission in idle state', () => {
      expect(canSubmit({ type: 'idle' })).toBe(true);
    });

    it('allows submission in composing state', () => {
      expect(canSubmit({ type: 'composing', draft: 'Hello' })).toBe(true);
    });

    it('allows submission in completed state', () => {
      expect(canSubmit({ type: 'completed' })).toBe(true);
    });

    it('prevents submission in submitting state', () => {
      expect(canSubmit({ type: 'submitting', requestId: 'req-1', userInput: 'Hello' })).toBe(false);
    });

    it('prevents submission in responding state', () => {
      expect(canSubmit({ type: 'responding', requestId: 'req-1' })).toBe(false);
    });
  });

  describe('canCancel', () => {
    it('allows cancellation in submitting state', () => {
      expect(canCancel({ type: 'submitting', requestId: 'req-1', userInput: 'Hello' })).toBe(true);
    });

    it('allows cancellation in responding state', () => {
      expect(canCancel({ type: 'responding', requestId: 'req-1' })).toBe(true);
    });

    it('prevents cancellation in idle state', () => {
      expect(canCancel({ type: 'idle' })).toBe(false);
    });

    it('prevents cancellation in completed state', () => {
      expect(canCancel({ type: 'completed' })).toBe(false);
    });
  });

  describe('getDraft', () => {
    it('returns draft in composing state', () => {
      expect(getDraft({ type: 'composing', draft: 'Hello' })).toBe('Hello');
    });

    it('returns null in idle state', () => {
      expect(getDraft({ type: 'idle' })).toBeNull();
    });

    it('returns null in submitting state', () => {
      expect(getDraft({ type: 'submitting', requestId: 'req-1', userInput: 'Hello' })).toBeNull();
    });
  });
});
