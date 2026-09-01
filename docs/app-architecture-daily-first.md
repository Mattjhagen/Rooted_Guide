# Plumb Line Architecture: Daily-First Flow

## Core Principle

The guide conversation is **supplemental and contextual**, not the main entry point.

## User Flow

1. **Entry**: App opens to today's Scripture passage (daily path)
2. **Reading**: User reads the passage without any AI interaction required
3. **Optional Conversation**: After reading, user may optionally tap "Ask about this"
4. **Contextual Guide**: If selected, guide receives only that passage's context

## Implementation Requirements

### Main Screen (`app/index.tsx`)

- Shows today's Scripture passage immediately
- **Does NOT** create `GuideGateway` on mount
- Passage is always readable, even when offline
- Guide button only appears if service is available

### Guide Invocation

- User must explicitly tap "Ask about this" button
- Button passes:
  - The specific passage ID(s) from the daily module
  - Bounded context (passage reference, user's reading state)
- GuideGateway created only when conversation starts

### Offline Behavior

- Daily Scripture path works perfectly offline
- Guide button hidden or disabled when unavailable
- **No error messages** interrupt the reading flow

### Data Flow

```
User opens app
    ↓
Display today's passage (from SQLite)
    ↓
[User reads - no AI involved]
    ↓
IF user taps "Ask about this"
  AND guide service available
    ↓
  Create GuideGateway with passage context
    ↓
  Show conversation interface
```

## Current vs. Required

**Current (WRONG)**:

- App opens to conversation interface
- GuideGateway created immediately
- If unavailable, shows error
- Daily path not implemented

**Required (CORRECT)**:

- App opens to Scripture passage
- GuideGateway created only on explicit request
- If unavailable, button hidden (no error)
- Daily path is the primary experience
