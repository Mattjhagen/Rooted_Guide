/**
 * Guide conversation state machine
 *
 * Manages the lifecycle of guide interactions with explicit states
 * to prevent duplicate sends, handle cancellation, and manage offline/error scenarios.
 */

export type GuideState =
  | { type: 'idle' }
  | { type: 'composing'; draft: string }
  | { type: 'submitting'; requestId: string; userInput: string }
  | { type: 'responding'; requestId: string }
  | { type: 'completed' }
  | { type: 'offline' }
  | { type: 'error'; message: string; recoverable: boolean }
  | { type: 'cancelled'; requestId: string };

export type GuideAction =
  | { type: 'START_COMPOSING'; draft: string }
  | { type: 'UPDATE_DRAFT'; draft: string }
  | { type: 'SUBMIT'; requestId: string; userInput: string }
  | { type: 'RESPOND'; requestId: string }
  | { type: 'COMPLETE' }
  | { type: 'CANCEL'; requestId: string }
  | { type: 'OFFLINE' }
  | { type: 'ERROR'; message: string; recoverable: boolean }
  | { type: 'RESET' };

/**
 * State machine reducer
 */
export function guideReducer(state: GuideState, action: GuideAction): GuideState {
  switch (action.type) {
    case 'START_COMPOSING':
      if (state.type === 'idle' || state.type === 'completed') {
        return { type: 'composing', draft: action.draft };
      }
      return state;

    case 'UPDATE_DRAFT':
      if (state.type === 'composing' || state.type === 'idle') {
        return { type: 'composing', draft: action.draft };
      }
      return state;

    case 'SUBMIT':
      if (state.type === 'composing' || state.type === 'idle' || state.type === 'completed') {
        return { type: 'submitting', requestId: action.requestId, userInput: action.userInput };
      }
      // Prevent duplicate submissions
      return state;

    case 'RESPOND':
      if (state.type === 'submitting' && state.requestId === action.requestId) {
        return { type: 'responding', requestId: action.requestId };
      }
      // Ignore responses for stale requests
      return state;

    case 'COMPLETE':
      if (state.type === 'responding') {
        return { type: 'completed' };
      }
      return state;

    case 'CANCEL':
      if (
        (state.type === 'submitting' || state.type === 'responding') &&
        state.requestId === action.requestId
      ) {
        return { type: 'cancelled', requestId: action.requestId };
      }
      return state;

    case 'OFFLINE':
      return { type: 'offline' };

    case 'ERROR':
      return { type: 'error', message: action.message, recoverable: action.recoverable };

    case 'RESET':
      return { type: 'idle' };

    default:
      return state;
  }
}

/**
 * Check if the current state allows submission
 */
export function canSubmit(state: GuideState): boolean {
  return state.type === 'idle' || state.type === 'composing' || state.type === 'completed';
}

/**
 * Check if the current state allows cancellation
 */
export function canCancel(state: GuideState): boolean {
  return state.type === 'submitting' || state.type === 'responding';
}

/**
 * Get the current draft text if available
 */
export function getDraft(state: GuideState): string | null {
  return state.type === 'composing' ? state.draft : null;
}
