# Prompt 4: Plumb Line Guide Experience (Revised)

**Status**: Refined — Conversational Direction  
**Date**: 2026-08-29

## Overview

Prompt 4 implements a personally-guided journey into Scripture. The app opens to a blinking cursor with the invitation "Let's begin with where you are." — not a questionnaire, not a chat interface, but a continuing conversation that naturally leads into today's Bible passage.

## Product Invariant

> The user is being personally guided through the Bible — not configuring an app, not chatting with an AI.
>
> The blinking cursor is the opening.  
> The conversation deepens context.  
> Scripture is the destination.

## Implementation

### 1. Opening Surface

The app launches directly into a quiet writing surface:

- **Focus**: Auto-focused multiline composer with visible blinking cursor
- **Invitation**: "Let's begin with where you are." — typography-led, spacious
- **No starter cards**: No option grids, preference chips, or questionnaire UI
- **No placeholder text**: The cursor itself is the invitation
- **Design**: Generous whitespace, calm typography, no chrome or dashboard elements

### 2. Conversational Progression

The conversation unfolds in three natural stages:

**First Exchange** (Turn 0-1):
- User shares where they are
- Plumb Line responds briefly and warmly (under 150 characters)
- Asks a natural follow-up question
- **No citations, no suggestions** — just conversation
- Examples: "I hear that. What's sitting with you this morning?"

**Second Exchange** (Turn 2-3):
- User deepens context
- Plumb Line acknowledges and gently transitions toward Scripture
- Invites them into today's 15-minute passage
- **Still no citations** — just the natural bridge
- Examples: "Let's spend a few minutes with something that might speak to where you are. Would you like to receive today's passage?"

**Scripture Path** (Turn 4+):
- Presents today's Verse of the Day with context
- Shows verified WEB citations from local SQLite
- Includes the 15-minute structure: Arrive → Receive → Reflect → Respond → Close
- **Optional "Continue the conversation" link** appears subtly below (not prominent)

**Visual Distinction**:
- User messages: Right-aligned, blue background
- Guide responses: Left-aligned, "PLUMB LINE" label, neutral background
- Citations: Dedicated cards with canonical reference, WEB label, and "View passage context"

### 3. Guide State Machine

The conversation state is managed by a typed reducer with explicit states:

```typescript
type GuideState =
  | { type: 'idle' }
  | { type: 'composing'; draft: string }
  | { type: 'submitting'; requestId: string; userInput: string }
  | { type: 'responding'; requestId: string }
  | { type: 'completed' }
  | { type: 'offline' }
  | { type: 'error'; message: string; recoverable: boolean }
  | { type: 'cancelled'; requestId: string };
```

**Key features**:

- Prevents duplicate sends by checking state before submission
- Supports cancellation of in-flight requests
- Uses request IDs to prevent stale responses from overwriting current state
- Handles offline and recoverable error states
- Bounds conversation context to 50 turns to prevent unbounded growth

### 4. Draft Persistence

Draft text is automatically saved to AsyncStorage and restored on relaunch:

- Saves draft on every text change
- Restores draft when app relaunches with empty conversation
- Clears draft after successful submission
- Gracefully handles storage failures without blocking the UI

### 5. Passage Context View

A minimal modal view that shows:

- The cited verse highlighted
- 3 verses before and after for context
- Canonical reference header
- WEB translation footer
- Simple "Done" button to return to conversation

**This is NOT the full reader** — that's Prompt 7. This is just enough context to understand a citation without leaving the conversation flow.

### 6. Accessibility

Full support for:

- **Screen readers**: All elements have proper labels, hints, and roles
- **Dynamic Type**: Respects system text size preferences
- **Keyboard navigation**: Focus order and keyboard-safe layout
- **Touch targets**: All interactive elements meet 44×44 minimum
- **Reduced motion**: Cursor animation respects system preference
- **Theme support**: Light, dark, and system automatic modes
- **Announcements**: State changes are announced to screen readers

## Mock Guide Gateway (Conversational)

The `MockGuideGateway` creates a three-stage conversational progression:

**Stage 1 — First Exchange** (turnCount 0-1):
- Responds to keywords: "anxious", "grateful", "tired", etc.
- Returns brief acknowledgment + natural question
- No citations, no suggestions
- Example: "I hear that. These early hours can feel heavy. What's sitting with you this morning?"

**Stage 2 — Second Exchange** (turnCount 2-3):
- Responds to context: "work", "peace", "stress", etc.
- Acknowledges and transitions toward Scripture
- No citations, no suggestions
- Example: "That weight is real. Let's spend a few minutes with something that might speak to where you are. Would you like to receive today's passage?"

**Stage 3 — Scripture Path** (turnCount 4+):
- Presents Verse of the Day: Psalm 23:1-3
- Shows full text with context and reflection prompt
- Includes verified WEB citations from local SQLite
- One optional suggestion: "Continue the conversation about this passage"

**No real AI** is used. No API calls, credentials, or external services.

## Tests

Comprehensive test coverage includes:

1. **State machine tests** (`guideStateMachine.test.ts`):
   - All state transitions
   - Duplicate submission prevention
   - Stale request handling
   - Cancellation support

2. **Hook tests** (`useGuide.test.ts`):
   - Message sending and turn creation
   - State transitions during send
   - Context bounding
   - Cancellation

3. **Accessibility tests** (`accessibility.test.tsx`):
   - Screen reader labels and hints
   - Touch target sizes
   - Role and state attributes

4. **Integration tests** (`guide-flow-integration.test.tsx`):
   - Initial cursor-focused state (no placeholder, no starters)
   - Message submission and draft handling
   - Citation rendering with WEB verification
   - Passage context view
   - Suggestion interaction (subtle, optional)

## Boundaries

### What Prompt 4 Includes

- Opening surface: "Let's begin with where you are." with cursor focus
- Three-stage conversational progression (no questionnaire UI)
- Brief, warm exchanges that naturally lead to Scripture
- Verse of the Day presentation with 15-minute structure
- Composer with draft persistence
- Conversation thread with clear user/guide/citation distinction
- Minimal passage context view
- Optional "Continue the conversation" action (subtle, contextual)
- Full state machine for interaction reliability
- Accessibility support

### What Prompt 4 Does NOT Include

- Full Bible reader (Prompt 7)
- Real AI integration (future prompts)
- Authentication or sync (explicitly excluded)
- Social/community features (explicitly excluded)
- Reading plans, streaks, points (explicitly excluded)
- Push notifications (explicitly excluded)

## Future Prompts

- **Prompt 5**: TBD
- **Prompt 7**: Full Bible reader with navigation, search, and reading experience
- **Later**: Real AI integration (server-side with credential rotation)

## Technical Notes

### Dependencies Added

- `@react-native-async-storage/async-storage`: For draft persistence

### Files Created

**State Management**:

- `src/features/guide/guideStateMachine.ts` — State machine reducer and helpers
- `src/features/guide/useDraftPersistence.ts` — Draft persistence hook

**UI Components**:

- `src/ui/components/PassageContextView.tsx` — Minimal passage context modal
- ~~`src/ui/components/StarterSuggestions.tsx`~~ — Removed in refinement (no longer used)

**Tests**:

- `src/__tests__/guideStateMachine.test.ts` — State machine tests
- `src/__tests__/accessibility.test.tsx` — Accessibility tests
- `src/__tests__/guide-flow-integration.test.tsx` — Integration tests

**Documentation**:

- `docs/prompt4-guide-experience.md` — This file

### Files Modified

- `src/features/guide/useGuide.ts` — Updated to use state machine
- `src/ui/components/Composer.tsx` — Added draft persistence and state awareness
- `src/ui/components/GuideMessage.tsx` — Added role labels and suggestion interaction
- `src/ui/components/CitationCard.tsx` — Added context view button and WEB label
- `app/index.tsx` — Complete rewrite for opening surface and guided thread
- `package.json` — Added AsyncStorage dependency

## Verification

All verification points from the refined direction:

✅ Blinking cursor auto-focused on launch  
✅ "Let's begin with where you are." opening (not "What's on your heart?")  
✅ No starter cards, no questionnaire UI, no option grids  
✅ Three-stage conversational progression  
✅ Brief exchanges (under 150 chars) that lead naturally to Scripture  
✅ Verse of the Day concept with 15-minute structure  
✅ Optional "Continue" suggestion (subtle, secondary to reading)  
✅ State machine prevents duplicate sends  
✅ Stale response prevention via request IDs  
✅ Draft persistence across relaunch  
✅ Conversation context bounded to 50 turns  
✅ Citation cards show WEB label and verified text  
✅ Passage context view with surrounding verses  
✅ Typography-led, spacious design  
✅ Full accessibility support  
✅ Light, dark, and system theme support  
✅ Comprehensive tests (103 passing)  
✅ Documentation updated  
✅ Mock AI only, no real AI/auth/sync  
✅ Bundle ID: `com.rooteddaily.bible`
